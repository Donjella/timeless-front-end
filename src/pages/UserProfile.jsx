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













}

export default UserProfile;