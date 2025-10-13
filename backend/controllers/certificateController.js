const PDFDocument = require("pdfkit");
const Certificate = require("../models/Certificate");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const Admin = require("../models/Admin");
const Notification = require("../models/Notification");
// exports.getCertificateByName = async (req, res) => {
//   try {
//     const {
//       firstName,
//       middleName,
//       lastName,
//       cgpa,
//       department,
//       endDate,
//       gender,
//     } = req.query;

//     if (
//       !firstName ||
//       !middleName ||
//       !lastName ||
//       !cgpa ||
//       !department ||
//       !endDate ||
//       !gender
//     ) {
//       return res.status(400).json({
//         message: "All fields are required, please fill and try again",
//       });
//     }

//     const endYear = parseInt(endDate, 10);

//     // Use case-insensitive regex for name fields
//     const certificate = await Certificate.findOne({
//       firstName: { $regex: new RegExp(`^${firstName}$`, "i") }, // Case-insensitive match
//       middleName: { $regex: new RegExp(`^${middleName}$`, "i") }, // Case-insensitive match
//       lastName: { $regex: new RegExp(`^${lastName}$`, "i") }, // Case-insensitive match
//       cgpa: cgpa,
//       department: department,
//       gender: gender,
//       $expr: { $eq: [{ $year: "$endDate" }, endYear] },
//     });

//     const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

//     if (!certificate && admin) {
//       await Notification.create({
//         adminId: admin._id,
//         firstName: firstName,
//         middleName: middleName,
//         lastName: lastName,
//         gender: gender,
//         message: `Verification failed for: ${firstName} ${middleName} ${lastName}`,
//         type: "error",
//       });
//       return res.status(404).json({ message: "Certificate not found" });
//     }

//     await Notification.create({
//       adminId: admin._id,
//       firstName: firstName,
//       middleName: middleName,
//       lastName: lastName,
//       gender: gender,
//       message: `Verification success: ${firstName} ${middleName} ${lastName} has been verified.`,
//       type: "success",
//     });
//     console.log("Certificate found:", certificate);
//     return res.status(200).json({ message: "Certificate found", certificate });
//   } catch (error) {
//     console.error("Error fetching certificate:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateID: req.params.id,
    });

    if (!certificate) {
      console.log("No certificate found"); // Debugging: Log if no certificate is found
      return res.status(404).json({ message: "Certificate not found" });
    }

    console.log("Certificate data:", certificate); // Debugging: Log the found certificate data
    res.json(certificate); // Return JSON here
  } catch (error) {
    console.error("Server error:", error); // Debugging: Log the server error details
    res.status(500).json({ message: "Server error" });
  }
};

const getGeoLocation = async (ip) => {
  try {
    const res = await fetch(`https://ipwho.is/${ip}`);
    const data = await res.json();
    if (data.success === false) return null;
    return {
      ip: data.ip,
      city: data.city,
      region: data.region,
      country: data.country,
      isp: data.connection?.isp,
    };
  } catch (err) {
    console.error("Geolocation lookup failed", err);
    return null;
  }
}
exports.getCertificateByName = async (req, res) => {
  try {
    const {
      firstName, middleName, lastName,
      cgpa, department, endDate, gender,
      programType, program,
    } = req.query;

    console.log("Query Parameters:", req.query);

    // Validate required fields
    if (!firstName || !middleName || !lastName || !cgpa || !department || !endDate || !gender) {
      return res.status(400).json({ message: "All fields are required, please fill and try again" });
    }

    // Validate graduation year
    if (isNaN(parseInt(endDate, 10))) {
      return res.status(400).json({ message: "Invalid graduation year" });
    }
    const endYear = parseInt(endDate, 10);

    // Validate CGPA
    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 2.0 || parsedCgpa > 4.0) {
      return res.status(400).json({ message: "CGPA must be between 2.0 and 4.00" });
    }

    // Get IP and geo location
    const userIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress;
    let geo = {};
    try {
      geo = await getGeoLocation(userIp);
    } catch (geoError) {
      console.error("Geo location failed:", geoError);
    }

    // Find certificate with case-insensitive search
    const certificate = await Certificate.findOne({
      firstName: { $regex: new RegExp(`^${firstName.trim()}$`, "i") },
      middleName: { $regex: new RegExp(`^${middleName.trim()}$`, "i") },
      lastName: { $regex: new RegExp(`^${lastName.trim()}$`, "i") },
      cgpa: parsedCgpa,
      department: { $regex: new RegExp(`^${department.trim()}$`, "i") },
      gender: { $regex: new RegExp(`^${gender.trim()}$`, "i") },
      $expr: { $eq: [{ $year: "$endDate" }, endYear] }, // Or string match alternative
      programType: { $regex: new RegExp(`^${programType.trim()}$`, "i") },
      program: { $regex: new RegExp(`^${program.trim()}$`, "i") },
    });

    console.log("Certificate Found:", certificate);

    // Get admin with fallback
    const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL }) || {};

    // Create notification
    await Notification.create({
      adminId: admin._id,
      firstName,
      middleName,
      lastName,
      gender,
      ip: geo?.ip || userIp,
      location: `${geo?.city || "Unknown"}, ${geo?.region || ""}, ${geo?.country || ""}`,
      message: certificate
        ? `✅ Verified: ${firstName} ${middleName} ${lastName}`
        : `❌ Failed Verification: ${firstName} ${middleName} ${lastName}`,
      type: certificate ? "success" : "error",
    });

    if (!certificate) {
      return res.status(404).json({ 
        message: `No certificate found for: ${firstName} ${middleName} ${lastName} in ${department} department` 
      });
    }

    return res.status(200).json(certificate);
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.generateCertificatePDF = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateID: req.params.id,
    });

    if (!certificate) return res.status(404).send("Certificate not found");

    const fullName = `${certificate.firstName} ${certificate.middleName} ${certificate.lastName}`;
    const department = `Bachelor of Science in ${certificate.department}`;
    const program = certificate.program;
    const programType = certificate.programType;

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: { top: 40, bottom: 20, left: 50, right: 50 },
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${certificate.firstName}_certificate.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // Border and background
    doc
      .save()
      .lineWidth(5)
      .strokeColor("#1a3e72")
      .fillColor("#fffdf6")
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .fillAndStroke()
      .restore();

    // University seal (top center)
    if (fs.existsSync("./public/university-seal.png")) {
      doc.image("./public/university-seal.png", doc.page.width / 2 - 70, 20, {
        width: 150,
      });
    }

    // Header text
    doc
      .moveDown(5)
      .fontSize(20)
      .fillColor("#1a3e72")
      .font("Helvetica-Bold")
      .text("GLA UNIVERSITY", { align: "center" })
      .moveDown(0.2)
      .fontSize(14)
      .font("Helvetica")
      .text("Office of the Registrar", { align: "center" })
      .moveDown(0.6)
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("CERTIFICATE OF COMPLETION", { align: "center", underline: true })
      .moveDown(0.8);

    // Main body text
    doc
      .fontSize(14)
      .fillColor("#333")
      .font("Helvetica")
      .text("This is to certify that", { align: "center" })
      .moveDown(0.6)
      .fontSize(26)
      .fillColor("#1a3e72")
      .font("Helvetica-Bold")
      .text(fullName.toUpperCase(), { align: "center" })
      .moveDown(0.6)
      .fontSize(14)
      .fillColor("#333")
      .font("Helvetica")
      .text("has successfully fulfilled all requirements for the degree of", {
        align: "center",
      })
      .moveDown(0.5)
      .fontSize(20)
      .fillColor("#1a3e72")
      .font("Helvetica-Bold")
      .text(department, { align: "center" })
      .moveDown(0.8);

    // Program duration
    doc
      .fontSize(12)
      .fillColor("#555")
      .font("Helvetica-Oblique")
      .text(
        `Program Duration: ${new Date(certificate.startDate).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )} to ${new Date(certificate.endDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        { align: "center" }
      )
      .moveDown(0.8);

    // Degree conferment
    doc
      .fontSize(12)
      .fillColor("#333")
      .font("Helvetica")
      .text(
        "The University Senate has conferred this degree with all the rights, privileges, and honors appertaining thereto.",
        { align: "center" }
      );

    // Signature section
    const sigY = doc.page.height - 170;

    doc
      .fontSize(12)
      .text("_________________________", 100, sigY, {
        align: "center",
        width: 200,
      })
      .font("Helvetica-Bold")
      .text("Dr. Jane Smith", 100, sigY + 20, { align: "center", width: 200 })
      .font("Helvetica")
      .text("University Registrar", 100, sigY + 40, {
        align: "center",
        width: 200,
      });

    doc
      .fontSize(12)
      .text("_________________________", doc.page.width / 2 - 100, sigY, {
        align: "center",
        width: 200,
      })
      .font("Helvetica-Bold")
      .text("Dr. Robert Johnson", doc.page.width / 2 - 100, sigY + 20, {
        align: "center",
        width: 200,
      })
      .font("Helvetica")
      .text("Dean, Faculty of Sciences", doc.page.width / 2 - 100, sigY + 40, {
        align: "center",
        width: 200,
      });

    doc
      .fontSize(12)
      .text("_________________________", doc.page.width - 300, sigY, {
        align: "center",
        width: 200,
      })
      .text("Date of Conferral", doc.page.width - 300, sigY + 20, {
        align: "center",
        width: 200,
      })
      .text(
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        doc.page.width - 300,
        sigY + 40,
        { align: "center", width: 200 }
      );

    // Bottom seal
    if (fs.existsSync("./public/university-seal.png")) {
      doc.image(
        "./public/university-seal.png",
        doc.page.width / 2 - 35,
        doc.page.height - 125,
        { width: 150 }
      );
    }

    // QR code
    doc
      .roundedRect(doc.page.width - 120, doc.page.height - 120, 80, 80, 5)
      .stroke("#1a3e72")
      .lineWidth(1);
    const qrUrl = `https://GLA-university-graduate-document.onrender.com/externalUser/certificate/${certificate.certificateID}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl);
    doc.image(qrDataUrl, doc.page.width - 110, doc.page.height - 110, {
      width: 60,
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
};
