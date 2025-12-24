
export const Logo = ({ size = 24, className = "", filtered }: { size?: number, className?: string, filtered?: boolean }) => {
    return (
        <img
            src="/icon-symbol.png"
            alt="LifeHub Logo"
            width={size}
            height={size}
            className={`object-contain ${className}`}
            style={filtered ? { filter: 'brightness(0) invert(1)' } : {}} // Simple white filter for dark backgrounds if needed
        />
    );
};
