
const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* University Introduction */}
      <section>
        <h1 className="text-4xl font-bold text-center mb-4">About GLA University</h1>
        <p className="text-lg text-gray-700 text-center">
          GLA University is one of Ethiopia’s emerging public institutions, committed to academic excellence, innovation, and regional development. Located in the Southwest region, it serves thousands of students in various fields of study, contributing to the nation's human capital and digital transformation.
        </p>
      </section>

      {/* Mission */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
        <p className="text-gray-700">
          To produce competent graduates, foster impactful research, and deliver community services that contribute to national development.
        </p>
      </section>

      {/* Vision */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Our Vision</h2>
        <p className="text-gray-700">
          To become a center of excellence in education, research, and innovation — known for producing ethical, solution-oriented graduates.
        </p>
      </section>

      {/* Project Overview */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">About This Project</h2>
        <p className="text-gray-700">
          This web application — the <strong>Graduate Document Verification System</strong> — was developed as a final year project by a Computer Science student at GLA University. The goal is to digitize and simplify the process of verifying graduate academic records in a secure and efficient manner.
        </p>
        <p className="text-gray-700 mt-2">
          The system is accessible at:{" "}
          <a
            href="https://GLA-university-graduate-document.onrender.com/"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GLA-university-graduate-document.onrender.com
          </a>
        </p>
        <p className="text-gray-700 mt-2">
          Built using the <strong>MERN stack (MongoDB, Express.js, React, Node.js)</strong>, the platform includes:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
          <li>Admin panel for uploading and managing graduate records</li>
          <li>Graduate search by name, department, and CGPA</li>
          <li>Secure verification system for employers and institutions</li>
          <li>Bulk certificate upload & real-time validation tools</li>
        </ul>
        <p className="text-gray-700 mt-2">
          This project reflects the university’s commitment to embracing digital transformation and improving transparency in academic verification.
        </p>
      </section>

      {/* Call to Action */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Join Us</h2>
        <p className="text-gray-700">
          Whether you're a student, employer, or academic institution, this system empowers you with trustworthy and accessible graduate verification tools. Explore, verify, and contribute to a transparent academic future with GLA University.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
