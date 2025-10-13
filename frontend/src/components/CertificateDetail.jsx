import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCertificate, FaSignature, FaCalendarAlt, FaRegStar } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';

const url = import.meta.env.VITE_BACKEND_URL 

const CertificateDetail = () => {
  // ... existing state and logic ...
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch(`${url}/api/certificates/${id}`);
        const data = await response.json();
        setCertificateData(data);
        setLoading(false);
        setQrCodeUrl(`${url}/api/certificates/${id}`);
        setCurrentDate(new Date().toLocaleDateString()); // Set current date
      } catch (error) {
        console.error('Error fetching certificate data:', error);
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [id]);

  const downloadCertificate = () => {
    const pdfUrl = `${url}/api/certificates/${id}/pdf`;
    window.open(pdfUrl, '_blank'); // Open the PDF in a new tab
  };

  const handleBack = () => {
    navigate('/externalUser');
  };

  if (loading) {
    return <p>Loading certificate details...</p>;
  }

  if (!certificateData) {
    return <p>Certificate not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="border-4 border-blue-600 dark:border-blue-400 p-6 relative"> {/* Added relative positioning */}
          {/* Compact Header */}
          <header className="flex items-center justify-between mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center flex-1">
              Certificate of Achievement
            </h1>
            <FaCertificate className="w-12 h-12 text-blue-600 dark:text-blue-400 ml-3" />
          </header>

          {/* Main Content */}
          <div className="space-y-4 text-center">
            <p className="text-base text-gray-600 dark:text-gray-300">This certifies that</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {certificateData.firstName} {certificateData.middleName} {certificateData.lastName}
            </h2>
            
            <p className="text-lg text-gray-700 dark:text-gray-300">has successfully completed</p>
            <h3 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-3">
              B.Sc in {certificateData.department}
            </h3>

            <div className="flex items-center justify-center text-gray-600 dark:text-gray-400 space-x-2 text-sm">
              <FaCalendarAlt className="w-4 h-4" />
              <span>
                {new Date(certificateData.startDate).toLocaleDateString()} -{' '}
                {new Date(certificateData.endDate).toLocaleDateString()}
              </span>
            </div>

            <p className="text-base italic text-gray-700 dark:text-gray-300 mt-4 px-2 sm:px-4">
              "We commend your dedication and exceptional performance throughout the course. 
              This certificate is a testament to your hard work and commitment."
            </p>

            {/* Achievements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              <div className="flex items-center justify-center bg-blue-50 dark:bg-gray-700 p-2 rounded-md">
                <FaRegStar className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Outstanding Performance</span>
              </div>
              <div className="flex items-center justify-center bg-blue-50 dark:bg-gray-700 p-2 rounded-md">
                <FaRegStar className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Excellent Participation</span>
              </div>
            </div>

            {/* Enhanced Signature Section with QR Code in bottom-right */}
            <footer className="mt-6 pt-4 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="text-center w-full sm:w-auto">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg inline-block">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Verified by</p>
                    <div className="flex items-center justify-center space-x-2">
                      <FaSignature className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                      <div className="relative">
                        <div className="signature-line w-32 h-6 bg-gradient-to-r from-transparent via-gray-400 to-transparent dark:via-gray-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                          Authorized Signature
                        </div>
                      </div>
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      GLA University Verification System
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date of Issue</p>
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300">{currentDate}</p>
                  </div>
                  
                  {/* QR Code positioned in bottom-right */}
                  <div className="bg-white p-2 rounded-md shadow-inner">
                    <QRCodeCanvas 
                      value={qrCodeUrl}
                      size={80}  // Slightly smaller size
                      bgColor="#ffffff"
                      fgColor="#1f2937"
                      level="H"
                    />
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>

        {/* Compact Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4 p-4 bg-gray-50 dark:bg-gray-700">
          <button 
            onClick={handleBack}
            className="px-4 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Back to Portal
          </button>
          <button 
            onClick={downloadCertificate}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};


export default CertificateDetail;