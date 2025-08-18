import { useState, useEffect } from 'react';

export const useDiscountForm = (discountToEdit) => {
    const [discount, setDiscount] = useState({
        code: "", percentage: "", fixedAmount: "",
        minOrderAmount: "", maxDiscountAmount: "",
        startDate: "", endDate: "", isActive: true,
    });
    
    useEffect(() => {
        if (discountToEdit) {
            setDiscount({
                code: discountToEdit.code || '',
                percentage: discountToEdit.percentage ?? '',
                fixedAmount: discountToEdit.fixedAmount ?? '',
                minOrderAmount: discountToEdit.minOrderAmount ?? '',
                maxDiscountAmount: discountToEdit.maxDiscountAmount ?? '',
                startDate: discountToEdit.startDate ? new Date(discountToEdit.startDate).toISOString().split('T')[0] : '',
                endDate: discountToEdit.endDate ? new Date(discountToEdit.endDate).toISOString().split('T')[0] : '',
                isActive: discountToEdit.isActive,
            });
        } else {
            setDiscount({
                code: "", percentage: "", fixedAmount: "", minOrderAmount: "",
                maxDiscountAmount: "", startDate: "", endDate: "", isActive: true,
            });
        }
    }, [discountToEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newDiscountState = { ...discount, [name]: type === 'checkbox' ? checked : value };
        
        if (name === 'percentage' && value) {
            newDiscountState.fixedAmount = '';
        } else if (name === 'fixedAmount' && value) {
            newDiscountState.percentage = '';
        }

        setDiscount(newDiscountState);
    };

    const getPayload = () => {
        const payload = {
            code: discount.code,
            startDate: discount.startDate,
            endDate: discount.endDate,
            isActive: discount.isActive,
        };

        const percentageValue = parseFloat(discount.percentage);
        if (!isNaN(percentageValue) && discount.percentage !== '') {
            payload.percentage = percentageValue;
        }

        const fixedAmountValue = parseFloat(discount.fixedAmount);
        if (!isNaN(fixedAmountValue) && discount.fixedAmount !== '') {
            payload.fixedAmount = fixedAmountValue;
        }

        const minOrderAmountValue = parseFloat(discount.minOrderAmount);
        if (!isNaN(minOrderAmountValue) && discount.minOrderAmount !== '') {
            payload.minOrderAmount = minOrderAmountValue;
        }

        const maxDiscountAmountValue = parseFloat(discount.maxDiscountAmount);
        if (!isNaN(maxDiscountAmountValue) && discount.maxDiscountAmount !== '') {
            payload.maxDiscountAmount = maxDiscountAmountValue;
        }

        return payload;
    };

    return { discount, handleChange, getPayload };
};