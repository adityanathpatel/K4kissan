// Input validation utilities

export const validators = {
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    phone: (value) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(value.replace(/\s/g, ''));
    },

    pincode: (value) => {
        const pincodeRegex = /^[0-9]{6}$/;
        return pincodeRegex.test(value);
    },

    price: (value) => {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0 && num < 1000000;
    },

    quantity: (value) => {
        const num = parseInt(value);
        return !isNaN(num) && num > 0 && num < 1000000;
    },

    required: (value) => {
        return value !== null && value !== undefined && value.toString().trim().length > 0;
    },

    minLength: (value, min) => {
        return value && value.toString().length >= min;
    },

    maxLength: (value, max) => {
        return value && value.toString().length <= max;
    }
};

// Sanitize inputs to prevent XSS
export const sanitize = {
    text: (value) => {
        if (!value) return '';
        return value.toString().trim();
    },

    number: (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    },

    integer: (value) => {
        const num = parseInt(value);
        return isNaN(num) ? 0 : num;
    }
};

// Error messages
export const errorMessages = {
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid 10-digit phone number',
    pincode: 'Please enter a valid 6-digit pincode',
    price: 'Please enter a valid price (greater than 0)',
    quantity: 'Please enter a valid quantity (greater than 0)',
    required: 'This field is required',
    minLength: (min) => `Minimum ${min} characters required`,
    maxLength: (max) => `Maximum ${max} characters allowed`
};
