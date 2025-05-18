
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface FormattedDateDisplayProps {
  dateString?: string;
  formatString: string;
  placeholder?: React.ReactNode;
}

export function FormattedDateDisplay({ dateString, formatString, placeholder = "..." }: FormattedDateDisplayProps) {
  const [formattedDate, setFormattedDate] = useState<React.ReactNode>(placeholder);

  useEffect(() => {
    if (dateString) {
      try {
        // Ensure the date is parsed correctly, new Date(isoString) is generally fine
        const date = new Date(dateString);
        // Check if date is valid after parsing
        if (!isNaN(date.getTime())) {
          setFormattedDate(format(date, formatString));
        } else {
          setFormattedDate("Invalid date");
        }
      } catch (error) {
        console.error("Error formatting date:", dateString, error);
        setFormattedDate("Error");
      }
    } else {
      setFormattedDate("-"); // Or some other indicator for no date
    }
  }, [dateString, formatString]);

  return <>{formattedDate}</>;
}
