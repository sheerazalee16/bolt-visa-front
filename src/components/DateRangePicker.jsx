import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

const DateRangePicker = () => {
    const [startDate, setStartDate] = useState(new Date('2025-07-01'));
    const [endDate, setEndDate] = useState(new Date('2025-07-15'));
    const [showPicker, setShowPicker] = useState(false); // toggle state
    console.log('startDate ', startDate)
    // const filteredDeals = deals.filter(deal => {
    //     const createdAt = new Date(deal.createdAt);
    //     return (
    //         (!startDate || createdAt >= startDate) &&
    //         (!endDate || createdAt <= endDate)
    //     );
    // });

    return (
        <div style={{ position: 'relative', display: 'inline-block', zIndex: 105 }}>

            <button
                onClick={() => setShowPicker(prev => !prev)}
                style={{
                    padding: '8px 12px',
                    backgroundColor: '#6b46c1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '10px'
                }}
            >
                <div className="flex items-center gap-2 ml-auto">
                    <Calendar className="h-4 w-4 text-purple-300" />
                    <div>
                        <p className="glass-effect border-purple-500/20 text-white w-auto">
                            {startDate ? startDate.toISOString() : ''}
                        </p>
                        <p className="glass-effect border-purple-500/20 text-white w-auto">
                            {endDate ? endDate.toLocaleDateString() : ''}
                        </p>
                    </div>

                </div>
            </button>

            {showPicker && (
                <div >
                    <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={([start, end]) => {
                            setStartDate(start);
                            setEndDate(end);
                        }}
                        isClearable
                        inline
                    />
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
