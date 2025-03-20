// basic structure for imports and components

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthData } from '../hooks/useAuthData';
import { api } from '../utils/api';




export function UserProfile (){

// declarations for state variable / hooks

const navigate = useNavigate();


const { authData } = useAuthData;


const [isLoading, setIsLoading] = useState(true);

const [error, setError] = useState('');

const [userProfile, setUserProfile] = useState(null);

const [isEditing, setIsEditing] = useState(false);

const [formData, setFormData] = useState({

});

// auth check , redirects to login if not authenticated
useEffect(() => {
    if (!authData.isAuthenticated) {
        navigate('/login');
    }
}, [authData.isAuthenticated, navigate]);

// fetch user profile data
useEffect(() => {
    const fetchUserProfile = async () => {
        if (!authData.isAuthenticated) return;
        
        setIsLoading(true);
        try{
            const userData = await api.auth.getProfile();
            setUserProfile(userData);

            // set form data with user profile info
            setFormData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                phone_number: userData.phone_number || '',
                street_address: userData.street_address || '',
                suburb: userData.suburb || '',
                state: userData.state || '',
                postcode: userData.postcode || '',
            });
        } catch (error) {
            console.error('Problem retrieving user profile:', error);
            setError('We failed to load your profile. Please try again or contact support.');
        } finally {
            setIsLoading(false);
        }
    };

    fetchUserProfile();
}), [authData.isAuthenticated];

const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
        ...formData,
        [name]: value,
    });
};

const handleEditToggle = () => {
    setIsEditing(!isEditing);

    // if cancelling edit, reset form data
    if (isEditing && userProfile) {
        setFormData({
            first_name: userProfile.first_name || '',
            last_name: userProfile.last_name || '',
            email: userProfile.email || '',
            phone_number: userProfile.phone_number || '',
            street_address: userProfile.street_address || '',
            suburb: userProfile.suburb || '',
            state: userProfile.state || '',
            postcode: userProfile.postcode || '',
        });
    }
}; 

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        setIsLoading(true);
        const updatedUserData = await api.auth.updateProfile(formData);
        setUserProfile(updatedUserData);
        setIsEditing(false);
    } catch (error) {
        console.error('Error updating profile:', error);
        setError(
            error.message || 'We encountered an error updating your profile. Please try again or contact support.'
        );
    } finally {
        setIsLoading(false);
    }
};


   
















}

export default UserProfile;