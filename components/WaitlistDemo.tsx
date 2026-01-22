"use client"
import React from 'react';
import { Waitlist } from './ui/waitlist';

export const WaitlistDemo = () => {
    return (
        <div className="w-full flex flex-col justify-center items-center">
            <div className="w-full max-w-2xl">
                <Waitlist mode="dark" />
            </div>
        </div>
    );
};
