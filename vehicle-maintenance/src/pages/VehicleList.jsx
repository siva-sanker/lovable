import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Car,
  Calendar,
  User,
  FileText,
  Fuel,
  Settings,
  Plus,
  Eye,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { vehicleAPI } from '../services/api';
import '../styles/Vehiclelist.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VehicleList = ({ sidebarCollapsed, toggleSidebar }) => {
  const [claimsModalOpen, setClaimsModalOpen] = useState(false);
  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [claimsError, setClaimsError] = useState('');

  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [vehiclesPerPage] = useState(10); // Number of vehicles to show per page

  const [insuranceData, setInsuranceData] = useState({
    policyNumber: '',
    insurer: '',
    policytype: '',
    startDate: '',
    endDate: '',
    payment: '',
    issueDate: '',
    premiumAmount: '',
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateVehicleAge = (purchaseDateString) => {
    const purchaseDate = new Date(purchaseDateString);
    const today = new Date();

    let age = today.getFullYear() - purchaseDate.getFullYear();
    const monthDiff = today.getMonth() - purchaseDate.getMonth();
    const dayDiff = today.getDate() - purchaseDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  };

  // Validation functions
  const validatePolicyNumber = (policyNumber) => {
    if (!policyNumber.trim()) {
      return 'Policy number is required';
    }
    if (policyNumber.trim().length < 5) {
      return 'Policy number must be at least 5 characters long';
    }
    if (!/^[A-Z0-9/-]+$/.test(policyNumber.trim())) {
      return 'Policy number can only contain letters, numbers, hyphens, and forward slashes';
    }
    return '';
  };

  const validateInsurer = (insurer) => {
    if (!insurer.trim()) {
      return 'Insurer name is required';
    }
    if (insurer.trim().length < 2) {
      return 'Insurer name must be at least 2 characters long';
    }
    if (!/^[A-Za-z\s]+$/.test(insurer.trim())) {
      return 'Insurer name can only contain letters and spaces';
    }
    return '';
  };

  const validatePolicyType = (policyType) => {
    if (!policyType) {
      return 'Policy type is required';
    }
    return '';
  };

  const validateDate = (date, fieldName) => {
    if (!date) {
      return `${fieldName} is required`;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fieldName === 'Start Date' && selectedDate < today) {
      return 'Start date cannot be in the past';
    }
    if (fieldName === 'Issue Date' && selectedDate > today) {
      return 'Issue date cannot be in the future';
    }
    return '';
  };

  const validateEndDate = (endDate, startDate) => {
    if (!endDate) {
      return 'End date is required';
    }
    if (startDate && endDate <= startDate) {
      return 'End date must be after start date';
    }
    return '';
  };

  const validatePremiumAmount = (amount) => {
    if (!amount) {
      return 'Premium amount is required';
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Premium amount must be a positive number';
    }
    if (numAmount > 1000000) {
      return 'Premium amount cannot exceed ₹10,00,000';
    }
    return '';
  };

  const validatePaymentMode = (payment) => {
    if (!payment) {
      return 'Payment mode is required';
    }
    return '';
  };

  const validateInsuranceForm = () => {
    const errors = {};

    errors.policyNumber = validatePolicyNumber(insuranceData.policyNumber);
    errors.insurer = validateInsurer(insuranceData.insurer);
    errors.policytype = validatePolicyType(insuranceData.policytype);
    errors.startDate = validateDate(insuranceData.startDate, 'Start Date');
    errors.endDate = validateEndDate(insuranceData.endDate, insuranceData.startDate);
    errors.issueDate = validateDate(insuranceData.issueDate, 'Issue Date');
    errors.premiumAmount = validatePremiumAmount(insuranceData.premiumAmount);
    errors.payment = validatePaymentMode(insuranceData.payment);

    setValidationErrors(errors);

    // Check if there are any errors
    return !Object.values(errors).some(error => error !== '');
  };

  // Pagination logic
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const navigate = useNavigate();
  const goToClaims = (vehicleId) => {
    navigate(`/claims?vehicleId=${vehicleId}`);
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await vehicleAPI.getAllVehicles();
        setVehicles(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVehicles();
  }, []);

  // Debug useEffect for modal states
  useEffect(() => {
    console.log('showModal changed to:', showModal);
  }, [showModal]);

  useEffect(() => {
    console.log('claimsModalOpen changed to:', claimsModalOpen);
  }, [claimsModalOpen]);

  useEffect(() => {
    console.log('selectedVehicle changed to:', selectedVehicle);
  }, [selectedVehicle]);

  const viewClaims = async (vehicleId) => {
    console.log('viewClaims called with vehicleId:', vehicleId);
    // Find the vehicle to check insurance
    const vehicle = vehicles.find(v => v.id === vehicleId);
    console.log('Found vehicle:', vehicle);

    // Check if vehicle has insurance
    if (!vehicle.insurance) {
      toast.error("Vehicle does not have insurance");
      return;
    }

    setLoadingClaims(true);
    setClaimsError('');
    try {
      // Set the vehicle as selectedVehicle
      setSelectedVehicle(vehicle);

      // Get claims from the vehicle object since they're stored there
      const vehicleClaims = vehicle?.claims || [];
      console.log('Vehicle claims:', vehicleClaims);
      setClaims(vehicleClaims);
    } catch (err) {
      console.error('Error loading claims:', err);
      setClaimsError('Failed to load claims');
      setClaims([]);
    } finally {
      setLoadingClaims(false);
      setClaimsModalOpen(true);
      console.log('claimsModalOpen set to true');
    }
  };

  const handleAddInsurance = async () => {
    if (!selectedVehicle?.id) {
      console.error("Selected vehicle is missing an ID.");
      return;
    }

    // Validate form before submission
    if (!validateInsuranceForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedVehicle = await vehicleAPI.patchVehicle(selectedVehicle.id, {
        insurance: insuranceData
      });

      if (updatedVehicle) {
        const updatedVehicles = vehicles.map((v) =>
          v.id === updatedVehicle.id ? updatedVehicle : v
        );
        setVehicles(updatedVehicles);
        setShowModal(false);
        setValidationErrors({});
        setInsuranceData({
          policyNumber: '',
          insurer: '',
          policytype: '',
          startDate: '',
          endDate: '',
          payment: '',
          issueDate: '',
          premiumAmount: '',
        });
        toast.success("Insurance information saved successfully!");
      } else {
        console.error("Failed to update insurance in db.json");
        toast.error("Failed to save insurance information");
      }
    } catch (error) {
      console.error("Error updating insurance:", error);
      toast.error("An error occurred while saving insurance information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setInsuranceData({
      policyNumber: '',
      insurer: '',
      policytype: '',
      startDate: '',
      endDate: '',
      payment: '',
      issueDate: '',
      premiumAmount: '',
    });
    setValidationErrors({});
    setIsSubmitting(false);
  };

  const populateFormWithExistingInsurance = (vehicle) => {
    if (vehicle.insurance) {
      setInsuranceData({
        policyNumber: vehicle.insurance.policyNumber || '',
        insurer: vehicle.insurance.insurer || '',
        policytype: vehicle.insurance.policytype || '',
        startDate: vehicle.insurance.startDate || '',
        endDate: vehicle.insurance.endDate || '',
        payment: vehicle.insurance.payment || '',
        issueDate: vehicle.insurance.issueDate || '',
        premiumAmount: vehicle.insurance.premiumAmount || '',
      });
    }
  };

  const showVehicleDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="vehicle-list-container">
        <div className="vehicle-list-header">
          <div className="header-content">
            <h1 className="page-title">
              <Car className="page-icon" />
              Registered Vehicles
            </h1>
            <p className="page-subtitle">Manage and view all your registered vehicles</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => navigate('/register-vehicle')}>
              <Plus size={16} />
              Add Vehicle
            </button>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div className="empty-state">
            <Car size={64} className="empty-icon" />
            <h3>No vehicles registered yet</h3>
            <p>Start by adding your first vehicle to the system</p>
            <button className="btn-primary" onClick={() => navigate('/register-vehicle')}>
              <Plus size={16} />
              Register Vehicle
            </button>
          </div>
        ) : (
          <div className="table-container">
            <div className="searchBar2">
              <input
                type="search"
                name="search"
                id="search"
                placeholder='Search by registration number...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Registration No.</th>
                  <th>Purchase Date</th>
                  <th>Color</th>
                  <th>Age</th>
                  <th>Fuel Type</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentVehicles.map((vehicle, index) => (
                  <tr key={index}>
                    <td className="text-capitalize">{vehicle.make}</td>
                    <td className="text-capitalize">{vehicle.model}</td>
                    <td className='text-uppercase'>{vehicle.registrationNumber}</td>
                    <td>{vehicle.purchaseDate}</td>
                    <td>{vehicle.color}</td>
                    <td>{calculateVehicleAge(vehicle.purchaseDate)} years</td>
                    <td>
                      <span className={`fuel-badge ${vehicle.fuelType.toLowerCase()}`}>
                        {vehicle.fuelType}
                      </span>
                    </td>
                    <td>₹{vehicle.purchasePrice}</td>
                    <td>
                      <button
                        className="btn-details"
                        onClick={() => showVehicleDetails(vehicle)}
                      >
                        <Info size={16} />
                        More Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredVehicles.length > vehiclesPerPage && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {indexOfFirstVehicle + 1} to {Math.min(indexOfLastVehicle, filteredVehicles.length)} of {filteredVehicles.length} vehicles
              {searchTerm && ` (filtered from ${vehicles.length} total)`}
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    className={`page-number ${currentPage === number ? 'active' : ''}`}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Vehicle Details Modal */}
        {showDetailsModal && selectedVehicle && (
          <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal" style={{
              backgroundColor: 'white',
              padding: '20px',
              border: '1px solid #e0e0e0',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div className="modal-header">
                <h3>Vehicle Details - {selectedVehicle.make} {selectedVehicle.model}</h3>
                <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="vehicle-details-card">
                  <div className="vehicle-card-header">
                    <div className="vehicle-info">
                      <h3 className="vehicle-name text-capitalize">{selectedVehicle.make} {selectedVehicle.model}</h3>
                      <p className="vehicle-registration text-uppercase">{selectedVehicle.registrationNumber}</p>
                    </div>
                    <span className="vehicle-year">
                      {new Date(selectedVehicle.purchaseDate).getFullYear()}
                    </span>
                  </div>

                  <div className="vehicle-card-body">
                    <div className="info-section">
                      <div className="section-header">
                        <Calendar size={16} className="section-icon" />
                        <h6>Basic Info</h6>
                      </div>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Color:</span>
                          <span className="info-value">{selectedVehicle.color}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Age:</span>
                          <span className="info-value">{calculateVehicleAge(selectedVehicle.purchaseDate)} years</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-section">
                      <div className="section-header">
                        <Fuel size={16} className="section-icon" />
                        <h6>Fuel Type</h6>
                        <span className={`fuel-badge ${selectedVehicle.fuelType.toLowerCase()}`}>
                          {selectedVehicle.fuelType}
                        </span>
                      </div>
                    </div>

                    <div className="info-section">
                      <div className="section-header">
                        <Settings size={16} className="section-icon" />
                        <h6>Engine Info</h6>
                      </div>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Engine No.:</span>
                          <span className="info-value">{selectedVehicle.engineNumber}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Chassis No.:</span>
                          <span className="info-value">{selectedVehicle.chassisNumber}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Price:</span>
                          <span className="info-value">₹{selectedVehicle.purchasePrice}</span>
                        </div>
                      </div>
                    </div>

                    <div className="info-section">
                      <div className="section-header">
                        <User size={16} className="section-icon" />
                        <h6>Owner Info</h6>
                      </div>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Owner:</span>
                          <span className="info-value">{selectedVehicle.owner}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Phone:</span>
                          <span className="info-value">{selectedVehicle.phone}</span>
                        </div>
                        <div className="info-item full-width">
                          <span className="info-label">Address:</span>
                          <span className="info-value">{selectedVehicle.address}</span>
                        </div>
                      </div>
                    </div>

                    {selectedVehicle.insurance ? (
                      <div className="info-section">
                        <div className="section-header">
                          <FileText size={16} className="section-icon" />
                          <h6>Insurance Info</h6>
                        </div>
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">Policy #:</span>
                            <span className="info-value">{selectedVehicle.insurance.policyNumber}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Insurer:</span>
                            <span className="info-value">{selectedVehicle.insurance.insurer}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Type:</span>
                            <span className="info-value">{selectedVehicle.insurance.policytype}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Premium:</span>
                            <span className="info-value">₹{selectedVehicle.insurance.premiumAmount}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="info-section">
                        <div className="section-header">
                          <FileText size={16} className="section-icon" />
                          <h6>Insurance Info</h6>
                        </div>
                        <div className="no-insurance">
                          <p>No insurance information available</p>
                        </div>
                      </div>
                    )}

                    <div className="vehicle-actions">
                      <button
                        className="btn-action"
                        onClick={() => {
                          console.log('View Claims clicked for vehicle:', selectedVehicle.id);
                          if (selectedVehicle.insurance) {
                            viewClaims(selectedVehicle.id);
                            setShowDetailsModal(false);
                          } else {
                            toast.error("Vehicle has no insurance");
                          }
                        }}
                      >
                        <Eye size={16} />
                        View Claims
                      </button>
                      <button
                        className="btn-action"
                        onClick={() => {
                          console.log('Add/Update Insurance clicked for vehicle:', selectedVehicle.id);
                          setShowDetailsModal(false);
                          if (selectedVehicle.insurance) {
                            populateFormWithExistingInsurance(selectedVehicle);
                          } else {
                            resetForm();
                          }
                          setShowModal(true);
                          console.log('showModal set to true, selectedVehicle:', selectedVehicle);
                        }}
                      >
                        <FileText size={16} />
                        {selectedVehicle.insurance ? 'Update Insurance' : 'Add Insurance'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Insurance Modal */}
        {showModal && (
          <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {console.log('Rendering insurance modal, showModal:', showModal, 'selectedVehicle:', selectedVehicle)}
            <div className="modal" style={{
              backgroundColor: 'white',
              padding: '20px',
              border: '1px solid #e0e0e0',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '70vh',
              overflowY: 'auto'
            }}>
              <div className="modal-header">
                <h3>{selectedVehicle?.insurance ? 'Update' : 'Add'} Insurance for {selectedVehicle?.make} {selectedVehicle?.model}</h3>
                <button className="modal-close" onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Policy Number *</label>
                    <input
                      type="text"
                      value={insuranceData.policyNumber}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, policyNumber: e.target.value });
                        if (validationErrors.policyNumber) {
                          setValidationErrors({ ...validationErrors, policyNumber: '' });
                        }
                      }}
                      placeholder="Enter policy number"
                      className={validationErrors.policyNumber ? 'error' : ''}
                    />
                    {validationErrors.policyNumber && (
                      <span className="error-message">{validationErrors.policyNumber}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Insurer *</label>
                    <input
                      type="text"
                      value={insuranceData.insurer}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, insurer: e.target.value });
                        if (validationErrors.insurer) {
                          setValidationErrors({ ...validationErrors, insurer: '' });
                        }
                      }}
                      placeholder="Enter insurer name"
                      className={validationErrors.insurer ? 'error' : ''}
                    />
                    {validationErrors.insurer && (
                      <span className="error-message">{validationErrors.insurer}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Policy Type *</label>
                    <select
                      value={insuranceData.policytype}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, policytype: e.target.value });
                        if (validationErrors.policytype) {
                          setValidationErrors({ ...validationErrors, policytype: '' });
                        }
                      }}
                      className={validationErrors.policytype ? 'error' : ''}
                    >
                      <option value="" selected disabled>Select policy type</option>
                      <option value="Comprehensive">Comprehensive</option>
                      <option value="Third Party">Third Party</option>
                      <option value="Liability">Liability</option>
                    </select>
                    {validationErrors.policytype && (
                      <span className="error-message">{validationErrors.policytype}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={insuranceData.startDate}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, startDate: e.target.value });
                        if (validationErrors.startDate) {
                          setValidationErrors({ ...validationErrors, startDate: '' });
                        }
                      }}
                      className={validationErrors.startDate ? 'error' : ''}
                    />
                    {validationErrors.startDate && (
                      <span className="error-message">{validationErrors.startDate}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      value={insuranceData.endDate}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, endDate: e.target.value });
                        if (validationErrors.endDate) {
                          setValidationErrors({ ...validationErrors, endDate: '' });
                        }
                      }}
                      className={validationErrors.endDate ? 'error' : ''}
                    />
                    {validationErrors.endDate && (
                      <span className="error-message">{validationErrors.endDate}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Issue Date *</label>
                    <input
                      type="date"
                      value={insuranceData.issueDate}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, issueDate: e.target.value });
                        if (validationErrors.issueDate) {
                          setValidationErrors({ ...validationErrors, issueDate: '' });
                        }
                      }}
                      className={validationErrors.issueDate ? 'error' : ''}
                    />
                    {validationErrors.issueDate && (
                      <span className="error-message">{validationErrors.issueDate}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Premium Amount *</label>
                    <input
                      type="number"
                      value={insuranceData.premiumAmount}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, premiumAmount: e.target.value });
                        if (validationErrors.premiumAmount) {
                          setValidationErrors({ ...validationErrors, premiumAmount: '' });
                        }
                      }}
                      placeholder="Enter premium amount"
                      min="0"
                      step="0.01"
                      className={validationErrors.premiumAmount ? 'error' : ''}
                    />
                    {validationErrors.premiumAmount && (
                      <span className="error-message">{validationErrors.premiumAmount}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Payment Mode *</label>
                    <select
                      value={insuranceData.payment}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, payment: e.target.value });
                        if (validationErrors.payment) {
                          setValidationErrors({ ...validationErrors, payment: '' });
                        }
                      }}
                      className={validationErrors.payment ? 'error' : ''}
                    >
                      <option value="" selected disabled>Select payment mode</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank account">Bank Account</option>
                    </select>
                    {validationErrors.payment && (
                      <span className="error-message">{validationErrors.payment}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}>Cancel</button>
                <button
                  className="btn-primary"
                  onClick={handleAddInsurance}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (selectedVehicle?.insurance ? 'Update Insurance' : 'Add Insurance')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Claims Modal */}
        {claimsModalOpen && (
          <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {console.log('Rendering claims modal, claimsModalOpen:', claimsModalOpen, 'selectedVehicle:', selectedVehicle)}
            <div className="modal" style={{
              backgroundColor: 'white',
              padding: '20px',
              border: '1px solid #e0e0e0',
              maxWidth: '500px',
              width: '90%',
              overflowY: 'auto'
            }}>
              <div className="modal-header">
                <h3>Claims History - {selectedVehicle?.make} {selectedVehicle?.model}</h3>
                <button className="modal-close" onClick={() => setClaimsModalOpen(false)}>×</button>
              </div>
              <div className="modal-body">
                {loadingClaims ? (
                  <div className="loading">Loading claims...</div>
                ) : claimsError ? (
                  <div className="error">{claimsError}</div>
                ) : claims.length === 0 ? (
                  <div className="empty-state">
                    <FileText size={48} className="empty-icon" />
                    <h4>No claims found</h4>
                    <p>This vehicle has no claims history.</p>
                  </div>
                ) : (
                  <div className="claims-list">
                    {claims.map((claim, index) => (
                      <div key={index} className="claim-item">
                        <div className="claim-header">
                          <h4>Claim #{index + 1}</h4>
                          <span className={`claim-status ${claim.status.toLowerCase()}`}>
                            {claim.status}
                          </span>
                        </div>
                        <div className="claim-details">
                          <div className="claim-info">
                            <span className="info-label">Date:</span>
                            <span className="info-value">{claim.claimDate}</span>
                          </div>
                          <div className="claim-info">
                            <span className="info-label">Amount:</span>
                            <span className="info-value">₹{claim.claimAmount}</span>
                          </div>
                          <div className="claim-info">
                            <span className="info-label">Reason:</span>
                            <span className="info-value">{claim.reason}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setClaimsModalOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer />
      </div>
      <Footer />
    </>
  );
};

export default VehicleList;