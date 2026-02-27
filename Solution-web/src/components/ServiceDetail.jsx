import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import './DigitalSignature.css'; // Reusing the same CSS
import { FaCheckCircle } from 'react-icons/fa';
import { serviceData } from '../data/serviceData';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const service = serviceData[serviceId];
  
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [uploadedFiles, setUploadedFiles] = React.useState({});
  const [infoInputs, setInfoInputs] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);


  const handleInputChange = (docName, value) => {
    setInfoInputs(prev => ({ ...prev, [docName]: value }));
  };

  const shouldFill = (name) => {
    const n = name.toLowerCase();
    
    // Explicit upload keywords (take precedence)
    const uploadKeywords = [
      'card', 'copy', 'certificate', 'registration', 'resolution', 'authorization', 
      'deed', 'agreement', 'bill', 'index', 'proof', 'photo', 'image', 'check', 
      'statement', 'report', 'manual', 'plan', 'declaration', 'list', 'invoice', 
      'profile', 'scrip', 'order', 'audit', 'financials', 'letter', 'form'
    ];
    if (uploadKeywords.some(keyword => n.includes(keyword))) return false;

    // Explicit fill keywords
    const fillKeywords = [
      'email', 'contact', 'number', 'name', 'mobile', 'address', 'capital', 
      'contribution', 'shares', 'suggestion', 'activity', 'description', 
      'details', 'profession', 'business', 'partner', 'amount', 'district', 
      'state', 'city', 'pin code', 'login id', 'password', 'code', 'id'
    ];
    if (fillKeywords.some(keyword => n.includes(keyword))) return true;

    return false; // Default to upload for safety
  };



  const isPhotoDoc = (name) => {
    const n = name.toLowerCase();
    return n.includes('photo') || n.includes('image') || n.includes('photograph');
  };

  const handleFileUpload = (docName, file) => {
    if (file) {
      if (isPhotoDoc(docName)) {
        if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
          alert('Please upload passport size photograph in JPG format only.');
          return;
        }
      } else {
        if (file.type !== 'application/pdf') {
          alert('Please upload documents in PDF format only.');
          return;
        }
      }
      setUploadedFiles(prev => ({ ...prev, [docName]: file }));
    }
  };



  const removeFile = (docName) => {
    setUploadedFiles(prev => {
      const updated = { ...prev };
      delete updated[docName];
      return updated;
    });
  };


  React.useEffect(() => {
    if (service && service.options && service.options.length > 0) {
      setSelectedOption(service.options[0]);
    }
  }, [service]);

  // If service not found, show error or redirect (simplified here)
  if (!service) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Service Not Found</h2>
        <button className="btn-back" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  // Determine which data to display based on selected option
  const baseData = (service.variants && selectedOption && service.variants[selectedOption]) 
    ? { ...service, ...service.variants[selectedOption] } 
    : service;

  const [selectedChecklist, setSelectedChecklist] = React.useState([]);

  // Clear checklist selection when variant changes
  React.useEffect(() => {
    setSelectedChecklist([]);
  }, [selectedOption]);

  const handleChecklistChange = (index) => {
    setSelectedChecklist(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  // Determine which data to display based on selected option
  const currentData = baseData;

  return (
    <section className="dsc-section">
      <div className="dsc-card">
        <h2 className="dsc-title">{service.title}</h2>

        {/* Radio Options */}
        {service.options && service.options.length > 0 && (
          <div className="dsc-options">
            {service.options.map((option, index) => (
              <label key={index} className="radio-label">
                <input 
                  type="radio" 
                  name="service-option" 
                  checked={selectedOption === option} 
                  onChange={() => setSelectedOption(option)}
                /> {option}
              </label>
            ))}
          </div>
        )}

        {/* Checklist for Variants */}
        {currentData.checklist && (
          <div className="dsc-checklist" style={{ margin: '20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', alignItems: 'start' }}>
            {currentData.checklist.map((item, idx) => {
              const isSelected = selectedChecklist.includes(idx);
              const label = item.label || item;
              
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ display: 'flex', alignItems: 'start', gap: '10px', fontSize: '14px', color: '#1a365d', cursor: 'pointer', lineHeight: '1.4' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleChecklistChange(idx)}
                      style={{ width: '16px', height: '16px', marginTop: '3px', cursor: 'pointer' }} 
                    />
                    {item.link ? (
                      <span 
                        onClick={(e) => { e.stopPropagation(); navigate(item.link); }} 
                        style={{ textDecoration: 'underline', color: '#0066cc', cursor: 'pointer' }}
                      >
                        {label}
                      </span>
                    ) : (
                      <span>{label}</span>
                    )}
                  </label>
                  
                  {isSelected && (item.price || item.documents || item.briefDescription) && (
                    <div style={{ marginTop: '10px', marginLeft: '26px', padding: '15px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                       {item.price && (
                         <p style={{ fontSize: '14px', marginBottom: '10px', fontFamily: 'sans-serif' }}>
                           <span style={{ color: '#008080', fontWeight: 'bold' }}>Charges :</span>{' '}
                           <span style={{ fontWeight: 'bold' }}>
                            {item.price.split('INR').length > 1 ? (
                              <>INR <span style={{color: 'red'}}>{item.price.split('INR')[1].split('/-')[0]}</span> /-{item.price.split('/-')[1]}</>
                            ) : item.price}
                           </span>
                         </p>
                       )}
                       {item.briefDescription && (
                         <div style={{ marginBottom: '10px' }}>
                           <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Brief Description about Service :</h5>
                           <p style={{ fontSize: '13px', color: '#333', margin: 0 }}>{item.briefDescription}</p>
                         </div>
                       )}
                        {item.documents && (
                          <div style={{ marginTop: '15px' }}>
                            <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Required Documents :</h5>
                            <ol style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: '#333' }}>
                              {item.documents.map((doc, i) => (
                                <li key={i} style={{ marginBottom: '10px' }}>
                                  <div className="doc-info">
                                    <span>{doc}</span>
                                    <span className="mandatory-star">*</span>
                                  </div>


                                  <div className="upload-container">
                                    {shouldFill(doc) ? (
                                      <input 
                                        type="text" 
                                        className="doc-text-input"
                                        placeholder={`Enter ${doc}`}
                                        value={infoInputs[`${item.label}-${doc}`] || ''}
                                        onChange={(e) => handleInputChange(`${item.label}-${doc}`, e.target.value)}
                                      />
                                    ) : (
                                      <>
                                        <input 
                                          type="file" 
                                          id={`file-variant-${idx}-${i}`} 
                                          className="file-input-hidden"
                                          accept={isPhotoDoc(doc) ? ".jpg,.jpeg" : ".pdf"}
                                          onChange={(e) => handleFileUpload(`${item.label}-${doc}`, e.target.files[0])}
                                        />
                                        {!uploadedFiles[`${item.label}-${doc}`] ? (
                                          <label htmlFor={`file-variant-${idx}-${i}`} className="btn-upload">
                                            {isPhotoDoc(doc) ? "Upload Image" : "Upload PDF"}
                                          </label>

                                        ) : (
                                          <div className="uploaded-file">
                                            <span>{uploadedFiles[`${item.label}-${doc}`].name}</span>
                                            <button className="btn-clear-file" onClick={() => removeFile(`${item.label}-${doc}`)}>✕</button>
                                          </div>
                                        )}

                                      </>
                                    )}

                                  </div>


                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                       {item.notes && (
                         <div style={{ marginTop: '15px' }}>
                           <h5 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '8px' }}>Important Notes :</h5>
                           <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: '#333' }}>
                             {item.notes.map((note, n) => (
                               <li key={n} style={{ marginBottom: '4px' }}>{note}</li>
                             ))}
                           </ul>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}



        {/* Pricing Info */}
        <div className="dsc-pricing">
          {currentData.price && (
            <div>
              <p className="price-text">Price: <span className="highlight-red">
                {currentData.price.includes('(+ GST)') ? (
                  <>
                    {currentData.price.split('(+ GST)')[0]}
                    <span style={{ color: 'black' }}>(+ GST)</span>
                    {currentData.price.split('(+ GST)')[1]}
                  </>
                ) : currentData.price}
              </span></p>
              {currentData.priceNote && <p className="note-text">{currentData.priceNote}</p>}
            </div>
          )}
          
          {currentData.delivery && (
            <div style={{ marginTop: currentData.price ? '10px' : '0' }}>
              <p className="delivery-text">Delivery Period: <span className="highlight-black">{currentData.delivery}</span></p>
              {currentData.deliveryNote && <p className="note-text">{currentData.deliveryNote}</p>}
            </div>
          )}
        </div>

        <div className="dsc-content-grid">
          {/* Documents List */}
          <div className="dsc-docs">
            {currentData.documents && currentData.documents.length > 0 && (
              <>
                <h3>Required Documents</h3>
                <ul>
                  {currentData.documents.map((doc, index) => (
                    <li key={index}>
                      <div className="doc-info">
                        <FaCheckCircle className="check-icon-blue" style={{ marginTop: '3px' }} />
                        <span>{doc}</span>
                        <span className="mandatory-star">*</span>
                      </div>


                      <div className="upload-container">
                        {shouldFill(doc) ? (
                          <input 
                            type="text" 
                            className="doc-text-input"
                            placeholder={`Enter ${doc}`}
                            value={infoInputs[doc] || ''}
                            onChange={(e) => handleInputChange(doc, e.target.value)}
                          />
                        ) : (
                          <>
                            <input 
                              type="file" 
                              id={`file-${index}`} 
                              className="file-input-hidden"
                              accept={isPhotoDoc(doc) ? ".jpg,.jpeg" : ".pdf"}
                              onChange={(e) => handleFileUpload(doc, e.target.files[0])}
                            />
                            {!uploadedFiles[doc] ? (
                              <label htmlFor={`file-${index}`} className="btn-upload">
                                {isPhotoDoc(doc) ? "Upload Image" : "Upload PDF"}
                              </label>

                            ) : (
                              <div className="uploaded-file">
                                <span>{uploadedFiles[doc].name}</span>
                                <button className="btn-clear-file" onClick={() => removeFile(doc)}>✕</button>
                              </div>
                            )}

                          </>
                        )}
                      </div>



                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Output Documents - New Section */}
            {currentData.outputDocuments && currentData.outputDocuments.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3>Output Documents</h3>
                <ul className="output-docs-list">
                  {currentData.outputDocuments.map((doc, index) => (
                    <li key={index} style={{ background: 'none', border: 'none', padding: 0, marginBottom: '12px', flexDirection: 'row', alignItems: 'center' }}>
                      <FaCheckCircle className="check-icon-blue" /> {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sub-sections (e.g. Company Details) */}
            {currentData.subSections && currentData.subSections.map((section, idx) => (
              <div key={idx} style={{ marginTop: '30px' }}>
                <h4 style={{ fontSize: '18px', color: '#1a365d', marginBottom: '15px' }}>{section.title}</h4>
                <ul>
                  {section.items && section.items.map((item, i) => (
                    <li key={i} style={{ background: 'none', border: 'none', padding: 0, marginBottom: '12px', flexDirection: 'row', alignItems: 'center' }}>
                      <FaCheckCircle className="check-icon-blue" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>


          {/* Description Box */}
          {currentData.description && (
            <div className="dsc-description-box">
              <h3>Brief Description about Service</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{currentData.description}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="dsc-actions">
          <button className="btn-back" onClick={() => navigate(-1)}>Back</button>
          <button 
            className={`btn-payment ${submitting ? 'submitting' : ''}`} 
            disabled={submitting}
            onClick={async () => {
              const missing = [];
              
              // Check main documents
              if (currentData.documents) {
                currentData.documents.forEach(doc => {
                  if (shouldFill(doc)) {
                    if (!infoInputs[doc]) missing.push(doc);
                  } else {
                    if (!uploadedFiles[doc]) missing.push(doc);
                  }
                });
              }

              // Check variant checklist documents
              if (currentData.checklist) {
                currentData.checklist.forEach((item, idx) => {
                  if (selectedChecklist.includes(idx) && item.documents) {
                    item.documents.forEach(doc => {
                      const key = `${item.label}-${doc}`;
                      if (shouldFill(doc)) {
                        if (!infoInputs[key]) missing.push(`${item.label}: ${doc}`);
                      } else {
                        if (!uploadedFiles[key]) missing.push(`${item.label}: ${doc}`);
                      }
                    });
                  }
                });
              }

              if (missing.length > 0) {
                alert(`Please complete the following mandatory fields:\n\n- ${missing.join('\n- ')}`);
                return;
              }

              try {
                setSubmitting(true);
                const formData = new FormData();
                formData.append('serviceId', serviceId);
                formData.append('selectedOption', selectedOption || '');
                formData.append('infoInputs', JSON.stringify(infoInputs));

                // Append files
                Object.keys(uploadedFiles).forEach(docName => {
                  formData.append(docName, uploadedFiles[docName]);
                });

                const response = await axios.post('http://localhost:5001/api/applications/submit', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.status === 'success') {
                  alert('Application submitted successfully! Our team will contact you shortly for payment.');
                  // Could navigate to a success page here
                }
              } catch (error) {
                console.error('Submission Error:', error);
                alert(error.response?.data?.message || 'Submission failed. Please check if the backend is running on port 5001.');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? 'Submitting...' : 'Payment'}
          </button>

        </div>

      </div>
    </section>
  );
};

export default ServiceDetail;
