export const formatNumber = (n: number) => new Intl.NumberFormat().format(n)
export const formatDate = (d: string | number | Date) => new Date(d).toLocaleString()


