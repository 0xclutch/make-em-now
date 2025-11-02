import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    TextField,
    Button,
    Paper,
    Typography,
    Container,
    Box,
    Alert,
    CircularProgress,
    Modal,
    Input,
    MenuItem,
    LinearProgress,
} from '@mui/material';
import { auth, supabase } from '../components/authy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import GeoApiAutocomplete from '../components/geoapi';
import { Breadcrumb } from 'antd'; // Import Breadcrumb from Ant Design
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'; // Import Link for navigation

import UpdateAccount from '../components/UpdateAccount';

const StyledPaper = styled(Paper)`
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
`;

const ControlPanelButtons = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 1rem;
`;

const SummaryCard = styled(Paper)`
    padding: 16px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    background: linear-gradient(90deg, #e3f2fd 0%, #fff 100%);
    box-shadow: 0 4px 16px rgba(33, 150, 243, 0.08);
`;

const StatCard = styled(Paper)`
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(90deg, #fceabb 0%, #f8b500 100%);
    box-shadow: 0 2px 8px rgba(248, 181, 0, 0.08);
`;

export default function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const DEBUG_MODE_ACTIVE = false;
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [userCount, setUserCount] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        uuid: '',
        firstname: '',
        middlename: '',
        lastname: '',
        age: 18,
        month: null,
        day: null,
        photo: '',
        houseNumber: '',
        street: '',
        suburb: '',
        state: 'QLD',
        postcode: '',
        country: 'AU',
    });

    const months = [
        { value: 1, label: 'January (1)' },
        { value: 2, label: 'February (2)' },
        { value: 3, label: 'March (3)' },
        { value: 4, label: 'April (4)' },
        { value: 5, label: 'May (5)' },
        { value: 6, label: 'June (6)' },
        { value: 7, label: 'July (7)' },
        { value: 8, label: 'August (8)' },
        { value: 9, label: 'September (9)' },
        { value: 10, label: 'October (10)' },
        { value: 11, label: 'November (11)' },
        { value: 12, label: 'December (12)' },
    ];

    const getValidationError = () => {
        const isEmpty = (v) => v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
        
        if (isEmpty(formData.email)) return 'Email is required.';
        if (isEmpty(formData.password)) return 'Password is required.';
        
        if (formData.age === null || formData.age === '' || formData.age === undefined) return 'Age is required.';
        const ageNum = Number(formData.age);
        if (!Number.isFinite(ageNum) || ageNum <= 0 || ageNum > 120) return 'Please enter a valid age (1-120).';
        
        if (formData.month === null || formData.month === '' || formData.month === undefined) return 'Month is required.';
        const monthNum = Number(formData.month);
        if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) return 'Please select a valid month.';
        
        if (formData.day === null || formData.day === '' || formData.day === undefined) return 'Day is required.';
        const dayNum = Number(formData.day);
        if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 31) return 'Please enter a valid day (1-31).';
        
        const hasAddressString = !isEmpty(formData.address);
        const hasAddressParts = !isEmpty(formData.houseNumber) && !isEmpty(formData.street);
        if (!hasAddressString && !hasAddressParts) return 'Please provide an address (either full address or house number + street).';
        
        return null;
    };

    const validateForm = () => getValidationError() === null;

    useEffect(() => {
        const checkUserSession = async () => {
            const userSession = await auth.getCurrentUser(); // Check current user session
            if (!userSession) {
                // Handle user not logged in (e.g., redirect to login)
                console.log('User is not logged in, redirecting to login...');
                navigate('/');
            }
        };

        checkUserSession(); // Call the function to check user session
        async function fetchStats() {
            setStatsLoading(true);
            setStatsError('');
            try {
                const { count, error } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true });
                if (error) throw error;
                setUserCount(count);
            } catch (err) {
                setStatsError('Failed to load stats: ' + err.message);
            } finally {
                setStatsLoading(false);
            }
        }
        fetchStats();
    }, []);

    const openCreateAccount = async () => {
        try {
            const { email, password } = await auth.createNextUser();
            console.log('Generated credentials:', { email, password }); // please do not use the uuid from here, its auto generated slop and wont work
            
            setFormData(prev => ({
                ...prev,
                email,
                password,
            }));
            setModalOpen(true);
            
            const credText = `Email: ${email}\nPassword: ${password}`;
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(credText);
                console.log('Credentials copied to clipboard');
            }
        } catch (err) {
            console.error('createNextUser failed:', err);
        }
    };

    const completeClientSide = async (e) => {
        setLoading(true);
        setSubmitError('');
        setUploadError('');
        
        try {
            let context = await auth.sendToAuth(formData.email, formData.password);
            if (!context) return;
            
            if (selectedFile && !formData.photo) {
                console.log("Legacy error! You did a big fuck up");
                throw new Error("Photo upload failed");
            } else if (!selectedFile && !formData.photo) {
                throw new Error("No photo provided");
            }
            
            console.log("Submitting values to auth: ", context.user);
            
            const profilePayload = {
                firstname: formData.firstname,
                middlename: formData.middlename || " ",
                lastname: formData.lastname,
                pin: 111111,
                email: formData.email,
                password: formData.password,
                uuid: context.user.id,
                photo: formData.photo,
                age: formData.age,
                month: formData.month,
                day: formData.day,
                houseNumber: formData.houseNumber,
                street: formData.street,
                suburb: formData.suburb,
                state: "QLD",
                postCode: formData.postcode,
                country: "AU",
            };
            
            if (DEBUG_MODE_ACTIVE) {
                console.log("[DEBUG_ACTIVE] Prevented upload for maintaince - Payload:", profilePayload);
                return;
            }
            
            const { data, error } = await supabase.from('users').insert([profilePayload]);
            if (error) {
                console.log("users table encountered an error: ", error.message);
                throw error;
            } else if (!error && data) {
                console.log("Account created! Registered on Supabase users table:", data);
            }
        } catch (err) {
            console.error('Error sending to auth:', err);
            setModalOpen(true);
            setLoading(false);
            return;
        } finally {
            setLoading(false);
            setModalOpen(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        
        const errMsg = getValidationError();
        if (errMsg) {
            setSubmitError(errMsg);
            return;
        }
        
        if (selectedFile && !formData.photo) {
            try {
                // Before anything, refreshSession to ensure valid auth state
                await auth.refreshSession();
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${formData.userId || 'user'}_${Date.now()}.${fileExt}`;
                
                if (DEBUG_MODE_ACTIVE) {
                    console.log("[DEBUG_ACTIVE] File ready to be uploaded. Cancelling storage - Payload:", { fileExt, fileName });
                    return;
                }
                
                const { data: upData, error: upError } = await supabase.storage
                    .from('user-images')
                    .upload(fileName, selectedFile, { upsert: true });
                if (upError) throw upError;
                
                const { data: urlData, error: urlError } = supabase.storage
                    .from('user-images')
                    .getPublicUrl(fileName);
                if (urlError) throw urlError;
                
                setFormData(prev => ({ ...prev, photo: urlData.publicUrl }));
            } catch (err) {
                console.error("Upload error:", err);
                setUploadError("Upload failed. Try again.");
                return;
            }
        }
        
        setModalStep(2);
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            await completeClientSide();
            setModalOpen(false);
            setModalStep(3); // Change modal step to 3 for success page
        } catch (err) {
            console.error("Submission failed: ", err);
            setSubmitError("Submission failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkUserSession = async () => {
        try {
            const userSession = await auth.getCurrentUser();
            if (!userSession) {
                console.log('User is not logged in, redirecting to login...');
                navigate('/');
            } else {
                console.log('User is logged in:', userSession);
                alert('Session is active!');
            }
        } catch (error) {
            console.error('Error checking session:', error);
            navigate('/');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Breadcrumb>
                <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
                <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            </Breadcrumb>
            
            <SummaryCard elevation={3}>
                <AccountCircleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                    <Typography variant="h6">User Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your accounts and settings here.
                    </Typography>
                </Box>
            </SummaryCard>

            <Button onClick={() => auth.signOut()} variant="contained" color="info" sx={{ mb: 3 }}>
                Sign Out
            </Button>

            <Button variant="contained" color="primary" onClick={checkUserSession} sx={{ ml: 2, mb: 3 }}>
                Check Session
            </Button>

            <Button variant='contained' sx={{ ml: 2, mb: 3 }}>
                <a href="https://myprojects.geoapify.com/">GeoAPIFY</a>
            </Button>

            <StyledPaper elevation={6}>
                <Typography variant="h5">Dashboard</Typography>
                <Box mt={2} textAlign="center">
                    <Typography variant="body1">
                        Welcome to your dashboard! You are successfully logged in.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        Select an option
                    </Typography>
                    <ControlPanelButtons>
                        <Button startIcon={<AddCircleIcon />} variant="contained" color="secondary" onClick={openCreateAccount}>
                            Create a New Account
                        </Button>
                        <Button startIcon={<DeleteIcon />} variant="contained" color="error">
                            Delete an Account
                        </Button>
                        <Button startIcon={<EditIcon />} variant="contained" color="primary" onClick={() => navigate('/updateaccount')}>
                            Update Account Details
                        </Button>
                    </ControlPanelButtons>
                </Box>
            </StyledPaper>

            <Typography variant="h6" gutterBottom>
                Live Statistics
            </Typography>
            <StatCard elevation={2}>
                <Box display="flex" alignItems="center">
                    <GroupIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
                    <Typography variant="body1">Total Users</Typography>
                </Box>
                <Box>
                    {statsLoading ? (
                        <CircularProgress size={24} />
                    ) : statsError ? (
                        <Alert severity="error">{statsError}</Alert>
                    ) : (
                        <Typography variant="h5" color="primary">
                            {userCount ?? '-'}
                        </Typography>
                    )}
                </Box>
            </StatCard>

            <Modal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setModalStep(1);
                }}
                sx={{ display: 'flex', alignContent: 'center', justifyContent: 'center', overflow: 'auto' }}
            >
                <Box sx={{
                    width: '90%',
                    maxWidth: 500,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}>
                    <LinearProgress variant="determinate" value={modalStep * 50} sx={{ borderRadius: 5, mb: 2, bgcolor: 'grey.300', '& .MuiLinearProgress-bar': { bgcolor: 'blue' } }} />
                    
                    {modalStep === 1 && (
                        <form onSubmit={handleSubmit} noValidate>
                            <Typography variant="h4" component="h3" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                Account Authentication is Ready
                            </Typography>
                            <Typography sx={{ mt: 2 }}>
                                Email: {formData.email}
                                <br />
                                Password: {formData.password}
                            </Typography>

                            <Typography sx={{ mt: 2 }} variant='h5'>Name</Typography>
                            <TextField
                                required
                                label="First Name"
                                fullWidth
                                sx={{ mt: 2 }}
                                value={formData.firstname}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstname: e.target.value }))}
                            />
                            <TextField
                                label='Middle Name'
                                fullWidth
                                sx={{ mt: 2 }}
                                value={formData.middlename}
                                onChange={(e) => setFormData(prev => ({ ...prev, middlename: e.target.value || " " }))}
                            />
                            <TextField
                                required
                                label="Last Name"
                                fullWidth
                                sx={{ mt: 2 }}
                                value={formData.lastname}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastname: e.target.value }))}
                            />

                            <Typography sx={{ mt: 2 }}>
                                General Information
                                <br />
                            </Typography>
                            <Input
                                required
                                type="number"
                                placeholder="Age"
                                fullWidth
                                sx={{ mt: 2 }}
                                value={formData.age ?? ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value ? Number(e.target.value) : '' }))}
                            />
                            <TextField
                                required
                                select
                                label="Month"
                                fullWidth
                                sx={{ mt: 2 }}
                                value={formData.month ?? ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    month: e.target.value ? parseInt(e.target.value, 10) : null,
                                }))}
                            >
                                {months.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Input
                                required
                                type="number"
                                placeholder="Day"
                                fullWidth
                                sx={{ mt: 2 }}
                                value={formData.day ?? ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value ? Number(e.target.value) : '' }))}
                            />

                            <Typography sx={{ mt: 5 }} variant='h5'>Address (autofill)</Typography>
                            <GeoApiAutocomplete
                                value={formData.address}
                                onChange={(place) => {
                                    if (!place) {
                                        setFormData(prev => ({
                                            ...prev,
                                            houseNumber: '',
                                            street: '',
                                            suburb: '',
                                            postcode: '',
                                        }));
                                        return;
                                    }

                                    if (typeof place === 'string') {
                                        setFormData(prev => ({ ...prev, address: place }));
                                        return;
                                    }

                                    const props = place.properties || {};
                                    const formatted = place.formatted || props.formatted || '';
                                    const houseNumber = props.housenumber || props.house_number || '';
                                    const street = props.street || props.road || props.street_name || '';
                                    const suburb = props.suburb || props.city_district || props.neighbourhood || props.city || '';
                                    const postcode = props.postcode || props.postal_code || '';

                                    setFormData(prev => ({
                                        ...prev,
                                        address: formatted || place || '',
                                        houseNumber,
                                        street,
                                        suburb,
                                        postcode,
                                    }));
                                }}
                                label="Address"
                                placeholder="Search address...."
                                countryCodes="au"
                                debounceMs={250}
                            />

                            <Typography sx={{ mt: 5 }} variant='h5'>User Portrait Photo:</Typography>
                            <Input
                                type='file'
                                fullWidth
                                sx={{ mt: 2 }}
                                inputProps={{ accept: 'image/*' }}
                                onChange={async (e) => {
                                    const file = e.target.files ? e.target.files[0] : null;
                                    setSelectedFile(file);
                                    if (file) {
                                        setFormData(prev => ({ ...prev, photo: '' }));
                                        try {
                                            const fileExt = file.name.split('.').pop();
                                            const fileName = `${formData.uuid || 'user'}_${Date.now()}.${fileExt}`;
                                            const { data: upData, error: upError } = await supabase.storage
                                                .from('user-images')
                                                .upload(fileName, file, { upsert: true });
                                            if (upError) throw upError;

                                            const { data: urlData, error: urlError } = await supabase.storage
                                                .from('user-images')
                                                .getPublicUrl(fileName);
                                            if (urlError) throw urlError;

                                            setFormData(prev => ({ ...prev, photo: urlData.publicUrl }));
                                        } catch (err) {
                                            console.error("Upload error!", err);
                                            setUploadError("Upload failed. Try again. " + err.message);
                                        }
                                    }
                                }}
                            />
                            {uploadError && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {uploadError}
                                </Alert>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                                {formData.photo && (
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                        Uploaded
                                    </Typography>
                                )}
                            </Box>
                            {submitError && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {submitError}
                                </Alert>
                            )}
                            <Box mt={3} textAlign="right">
                                <Button type="submit" variant="contained" disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : 'Save and Upload'}
                                </Button>
                            </Box>
                        </form>
                    )}

                    {modalStep === 2 && (
                        <Box>
                            <Typography variant='h4' textAlign='center' fontWeight={'bold'}>
                                Confirm Account Details
                            </Typography>
                            <Typography sx={{ mt: 2 }}><strong>Email:</strong> {formData.email}</Typography>
                            <Typography><strong>First Name:</strong> {formData.firstname}</Typography>
                            <Typography><strong>Middle Name:</strong> {formData.middlename}</Typography>
                            <Typography><strong>Last Name:</strong> {formData.lastname}</Typography>
                            <Typography><strong>Age:</strong> {formData.age}</Typography>
                            <Typography><strong>Birth:</strong> {formData.day}/{formData.month}</Typography>
                            <Typography>
                                <strong>Address:</strong> {formData.houseNumber} {formData.street}, {formData.suburb}, {formData.state} {formData.postcode}
                            </Typography>
                            {formData.photo && (
                                <img src={formData.photo} alt="User Portrait" style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }} />
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                                <Button variant="outlined" color="secondary" onClick={() => setModalStep(1)}>
                                    Back
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleFinalSubmit} disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : 'Confirm & Submit'}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {modalStep === 3 && ( // New success page
                        <Box textAlign="center">
                            <Typography variant='h4' fontWeight={'bold'}>
                                Success!
                            </Typography>
                            <Typography variant='body1'>
                                Your account has been successfully created.
                            </Typography>
                            <Button variant="contained" color="primary" onClick={() => setModalStep(1)}>
                                Go to Dashboard
                            </Button>
                        </Box>
                    )}
                </Box>
            </Modal>


        </Container>
    );
}