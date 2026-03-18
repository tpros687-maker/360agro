// frontend/src/components/Skeleton.jsx
import React from 'react';

const Skeleton = ({ className }) => {
    return (
        <div className={`animate-pulse bg-white/5 rounded-xl ${className}`}></div>
    );
};

export const CardSkeleton = () => (
    <div className="card-midnight p-6 bg-agro-charcoal space-y-4 border border-white/5">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex justify-between items-center pt-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
        </div>
    </div>
);

export const TableRowSkeleton = () => (
    <div className="flex items-center gap-4 py-4 border-b border-white/5">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-8 w-20 rounded-xl" />
    </div>
);

export const ProfileSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 bg-white/5 rounded-full"></div>
            <div className="w-48 h-8 bg-white/5 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
            ))}
        </div>
    </div>
);

export default Skeleton;
