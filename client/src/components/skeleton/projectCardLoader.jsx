import React from "react";

const CardSkeleton = () => {
    return (
        <div 
            role="status" 
            className="w-full flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-900 bg-slate-950/40 p-6 animate-pulse min-h-[220px]"
        >
            {/* Header Content */}
            <div>
                <div className="flex items-start gap-3.5 mb-4">
                    {/* Icon Skeleton */}
                    <div className="w-10 h-10 rounded-xl bg-slate-900 shrink-0"></div>
                    {/* Title & Tag Skeleton */}
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-3.5 bg-slate-900 rounded-full w-3/4"></div>
                        <div className="h-2 bg-slate-900 rounded-full w-1/4"></div>
                    </div>
                </div>

                {/* Description Skeleton */}
                <div className="space-y-2.5 mb-6">
                    <div className="h-2.5 bg-slate-900 rounded-full w-full"></div>
                    <div className="h-2.5 bg-slate-900 rounded-full w-5/6"></div>
                    <div className="h-2.5 bg-slate-900 rounded-full w-2/3"></div>
                </div>
            </div>

            {/* Action Footer Skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-900/60 mt-auto">
                <div className="h-2 bg-slate-900 rounded-full w-1/3"></div>
                <div className="h-2.5 bg-slate-900 rounded-full w-12"></div>
            </div>
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default CardSkeleton;