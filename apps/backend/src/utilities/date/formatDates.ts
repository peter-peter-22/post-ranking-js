/** Get the day, month and year from a given date. */
export function dayMonthYear(date:Date){
    return{
        day:date.getDate(),
        month:date.getMonth()+1,
        year:date.getFullYear()
    }
}

/** Format a date as "YYYY/MM/DD". */
export function formatDate(date:Date){
    const {day,month,year} = dayMonthYear(date)
    return `${year}/${month}/${day}`
}