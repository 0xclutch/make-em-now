// modal form 
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Alert } from '@mui/material';
import { supabase, auth } from './authy';
import PropTypes from 'prop-types';

export default function UpdateAccount({ open, onClose, userId }) {
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [address, setAddress] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleUpdate = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Ensure valid session before updating
            await auth.ensureValidSession();

            const updates = {};
            if (firstName) updates.firstname = firstName;
            if (middleName) updates.middlename = middleName;
            if (lastName) updates.lastname = lastName;
            if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
            if (address) updates.address = address;
            if (pin) updates.pin = parseInt(pin, 10);

            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('uuid', userId);

            if (error) throw error;

            setSuccess('Account updated successfully!');
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Update error:', err);
            setError('Failed to update account: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDialogClose = () => {
        // Reset form on close
        setFirstName('');
        setMiddleName('');
        setLastName('');
        setDateOfBirth('');
        setAddress('');
        setPin('');
        setError('');
        setSuccess('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleDialogClose}>
            <DialogTitle>Update Account Details</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                
                <TextField
                    margin="dense"
                    label="First Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Middle Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Last Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Date of Birth (DD/MM/YYYY)"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Address"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="PIN (6 digit)"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    inputProps={{ maxLength: 6 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

UpdateAccount.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
};
