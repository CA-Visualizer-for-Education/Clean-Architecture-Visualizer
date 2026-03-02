import React from 'react';

interface DropdownProps {
    options: string[];
    onSelect: (option: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedOption, setSelectedOption] = React.useState<string | null>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
        onSelect(option);
        setIsOpen(false);
    };

    return (
        <div className="dropdown">
            <button onClick={toggleDropdown}>
                {selectedOption || 'Select an option'}
            </button>
            {isOpen && (
                <ul className="dropdown-menu">
                    {options.map((option) => (
                        <li key={option} onClick={() => handleOptionClick(option)}>
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;