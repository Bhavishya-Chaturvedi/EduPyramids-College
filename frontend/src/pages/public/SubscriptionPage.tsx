import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  FormControlLabel,
  RadioGroup,
  Radio,
  Grid,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BuildingIcon from '@mui/icons-material/Business';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import HistoryIcon from '@mui/icons-material/History';

interface AcademicCenter {
  id: number;
  academic_code: string;
  institution_name: string;
}

interface GSTFieldData {
  [key: string]: {
    wantGST: string;
    gstNumber: string;
    gstName: string;
  };
}

interface Transaction {
  payment_date: string;
  transaction_id: string;
  subscription_end_date: string;
  institute_name: string;
  gst_number: string;
  order_status: string;
}

// Dummy data for states
const DUMMY_STATES = [
  { id: 1, name: 'Andhra Pradesh' },
  { id: 2, name: 'Arunachal Pradesh' },
  { id: 3, name: 'Assam' },
  { id: 4, name: 'Bihar' },
  { id: 5, name: 'Chhattisgarh' },
  { id: 6, name: 'Goa' },
  { id: 7, name: 'Gujarat' },
  { id: 8, name: 'Haryana' },
  { id: 9, name: 'Himachal Pradesh' },
  { id: 10, name: 'Jharkhand' },
  { id: 11, name: 'Karnataka' },
  { id: 12, name: 'Kerala' },
  { id: 13, name: 'Madhya Pradesh' },
  { id: 14, name: 'Maharashtra' },
  { id: 15, name: 'Manipur' },
  { id: 16, name: 'Meghalaya' },
  { id: 17, name: 'Mizoram' },
  { id: 18, name: 'Nagaland' },
  { id: 19, name: 'Odisha' },
  { id: 20, name: 'Punjab' },
  { id: 21, name: 'Rajasthan' },
  { id: 22, name: 'Sikkim' },
  { id: 23, name: 'Tamil Nadu' },
  { id: 24, name: 'Telangana' },
  { id: 25, name: 'Tripura' },
  { id: 26, name: 'Uttar Pradesh' },
  { id: 27, name: 'Uttarakhand' },
  { id: 28, name: 'West Bengal' },
];

// Dummy data for academic centers per state
const DUMMY_ACADEMIC_CENTERS: { [key: string]: AcademicCenter[] } = {
  '1': [
    { id: 101, academic_code: 'AP001', institution_name: 'Andhra University, Visakhapatnam' },
    { id: 102, academic_code: 'AP002', institution_name: 'Sri Venkateswara University, Tirupati' },
    { id: 103, academic_code: 'AP003', institution_name: 'Osmania University, Hyderabad' },
  ],
  '2': [
    { id: 201, academic_code: 'AR001', institution_name: 'North Eastern University, Itanagar' },
    { id: 202, academic_code: 'AR002', institution_name: 'Delhi Skill University, Arunachal Campus' },
  ],
  '3': [
    { id: 301, academic_code: 'AS001', institution_name: 'Gauhati University, Guwahati' },
    { id: 302, academic_code: 'AS002', institution_name: 'Dibrugarh University, Dibrugarh' },
    { id: 303, academic_code: 'AS003', institution_name: 'Indian Institute of Technology Guwahati' },
  ],
  '14': [
    { id: 1401, academic_code: 'MH001', institution_name: 'University of Mumbai, Mumbai' },
    { id: 1402, academic_code: 'MH002', institution_name: 'Indian Institute of Technology Bombay' },
    { id: 1403, academic_code: 'MH003', institution_name: 'Pune University, Pune' },
    { id: 1404, academic_code: 'MH004', institution_name: 'NMIMS University, Mumbai' },
  ],
  '26': [
    { id: 2601, academic_code: 'UP001', institution_name: 'University of Lucknow, Lucknow' },
    { id: 2602, academic_code: 'UP002', institution_name: 'Indian Institute of Technology BHU, Varanasi' },
    { id: 2603, academic_code: 'UP003', institution_name: 'Aligarh Muslim University, Aligarh' },
  ],
};

const SubscriptionPage: React.FC = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
  });

  const [selectedInstitutes, setSelectedInstitutes] = useState<number[]>([]);
  const [academicCenters, setAcademicCenters] = useState<AcademicCenter[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [gstFields, setGSTFields] = useState<GSTFieldData>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [userTransactions] = useState<Transaction[]>([]);
  const [isAuthenticated] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (formData.state) {
      fetchAcademicCenters(formData.state);
    }
  }, [formData.state]);

  const fetchAcademicCenters = async (stateId: string) => {
    setLoadingCenters(true);
    try {
      const dummyData = DUMMY_ACADEMIC_CENTERS[stateId] || [];
      await new Promise(resolve => setTimeout(resolve, 300));
      setAcademicCenters(dummyData);
    } catch (error) {
      console.error('Error fetching academic centers:', error);
      setAcademicCenters([]);
    }
    setLoadingCenters(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;

    if (name === 'amount') {
      setAmount(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleInstituteChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const newSelected = e.target.value as number[];
    setSelectedInstitutes(newSelected);

    const newGSTFields: GSTFieldData = {};
    newSelected.forEach((id) => {
      if (!gstFields[id]) {
        newGSTFields[id] = { wantGST: '', gstNumber: '', gstName: '' };
      } else {
        newGSTFields[id] = gstFields[id];
      }
    });
    setGSTFields(newGSTFields);
  };

  const handleGSTChange = (instituteId: number, field: string, value: string) => {
    setGSTFields((prev) => ({
      ...prev,
      [instituteId]: {
        ...prev[instituteId],
        [field]: value,
      },
    }));
  };

  const validateGSTNumber = (gstNumber: string): boolean => {
    const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
    return gstRegex.test(gstNumber);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (selectedInstitutes.length === 0) {
      newErrors.institute = 'Please select at least one institute';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Payment amount must be greater than 0';
    }

    selectedInstitutes.forEach((id) => {
      const gst = gstFields[id];
      if (gst && gst.wantGST === 'yes') {
        if (!gst.gstNumber.trim() || !validateGSTNumber(gst.gstNumber)) {
          newErrors[`gst_${id}`] = 'Invalid GST number';
        }
        if (!gst.gstName.trim()) {
          newErrors[`gstName_${id}`] = 'GST Name is required';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    try {
      const stateName = DUMMY_STATES.find(s => s.id === parseInt(formData.state))?.name || formData.state;

      const paymentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        state: stateName,
        academic_ids: selectedInstitutes,
        amount: parseFloat(amount),
        gst_data: gstFields,
      };

      const response = await fetch('http://localhost:8000/api/payments/academic/session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment session');
      }

      const data = await response.json();

      if (data.payment_link) {
        window.location.href = data.payment_link;
      } else {
        alert('Payment link not received. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'An error occurred. Please try again.'}`);
    }
    setSubmitLoading(false);
  };

  const getStatusBadgeColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    if (status === 'CHARGED') return 'success';
    if (status === 'PENDING' || status === 'PENDING_VBV' || status === 'AUTHORIZING') return 'warning';
    if (status === 'NO_TRANSACTION') return 'default';
    return 'error';
  };

  const getStatusLabel = (status: string): string => {
    if (status === 'CHARGED') return 'Paid';
    if (status === 'PENDING' || status === 'PENDING_VBV' || status === 'AUTHORIZING') return 'Pending';
    if (status === 'NO_TRANSACTION') return 'No Payment';
    return 'Failed';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          Annual Academic Subscription
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Name Field */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="Enter your full name"
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            {/* Email Field */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                error={!!errors.email}
                helperText={errors.email}
                placeholder="Enter your email"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            {/* Phone Field */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="Enter phone number"
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            {/* State Field */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth error={!!errors.state}>
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange as any}
                  label="State"
                >
                  <MenuItem value="">-- Select State --</MenuItem>
                  {DUMMY_STATES.map((state) => (
                    <MenuItem key={state.id} value={state.id}>
                      {state.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Academic Institute Field */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth error={!!errors.institute}>
                <InputLabel>Academic Institute</InputLabel>
                <Select
                  multiple
                  name="institute"
                  value={selectedInstitutes}
                  onChange={handleInstituteChange as any}
                  label="Academic Institute"
                  disabled={loadingCenters || !formData.state}
                >
                  {loadingCenters ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} /> Loading...
                    </MenuItem>
                  ) : (
                    academicCenters.map((center) => (
                      <MenuItem key={center.id} value={center.id}>
                        {center.academic_code} - {center.institution_name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                You can search institute by academic code or name.
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Payment can be made for multiple institutes simultaneously.
              </Typography>
            </Grid>

            {/* Amount Field */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Amount (₹)"
                name="amount"
                value={amount}
                onChange={handleFormChange}
                error={!!errors.amount}
                helperText={errors.amount || 'Enter the payment amount in rupees'}
                type="number"
                placeholder="Enter amount"
                inputProps={{ step: '1', min: '0' }}
                InputProps={{
                  startAdornment: <CurrencyRupeeIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            {/* GST Fields */}
            {selectedInstitutes.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  GST Details
                </Typography>
                {selectedInstitutes.map((instituteId) => {
                  const institute = academicCenters.find((c) => c.id === instituteId);
                  const gst = gstFields[instituteId] || { wantGST: '', gstNumber: '', gstName: '' };

                  return (
                    <Paper key={instituteId} variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        <BuildingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        {institute?.academic_code} - {institute?.institution_name}
                      </Typography>

                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Do you want a GST-compliant invoice? <span style={{ color: 'red' }}>*</span>
                      </Typography>

                      <RadioGroup
                        row
                        name={`want_gst_${instituteId}`}
                        value={gst.wantGST}
                        onChange={(e) => handleGSTChange(instituteId, 'wantGST', e.target.value)}
                      >
                        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio />} label="No" />
                      </RadioGroup>

                      <Typography variant="caption" display="block" sx={{ mt: 1, mb: 2, color: 'text.secondary' }}>
                        <strong>Note:</strong> A GST-compliant invoice will be provided only if you select "Yes" and enter valid GST
                        details. If you select "No", this option cannot be changed to "Yes" later.
                      </Typography>

                      {gst.wantGST === 'yes' && (
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              label="GST Number"
                              value={gst.gstNumber}
                              onChange={(e) => handleGSTChange(instituteId, 'gstNumber', e.target.value)}
                              error={!!errors[`gst_${instituteId}`]}
                              helperText={errors[`gst_${instituteId}`]}
                              inputProps={{ maxLength: 15 }}
                              required
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 8 }}>
                            <TextField
                              fullWidth
                              label="Name as per GST"
                              value={gst.gstName}
                              onChange={(e) => handleGSTChange(instituteId, 'gstName', e.target.value)}
                              error={!!errors[`gstName_${instituteId}`]}
                              helperText={errors[`gstName_${instituteId}`]}
                              required
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Paper>
                  );
                })}
              </Grid>
            )}

            {/* Submit Button */}
            <Grid size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={submitLoading}
                startIcon={<PaymentIcon />}
              >
                {submitLoading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : 'Make Payment'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Transaction History */}
      {isAuthenticated && userTransactions.length > 0 && (
        <Paper elevation={2} sx={{ mt: 4, p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon /> Your Transaction History
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Payment Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Subscription End Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Institute Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>GST Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userTransactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(transaction.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {transaction.transaction_id}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(transaction.subscription_end_date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.institute_name}</TableCell>
                    <TableCell>{transaction.gst_number}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(transaction.order_status)}
                        color={getStatusBadgeColor(transaction.order_status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {isAuthenticated && userTransactions.length === 0 && (
        <Alert severity="info" sx={{ mt: 4 }}>
          No transaction history found for your account.
        </Alert>
      )}
    </Container>
  );
};

export default SubscriptionPage;
