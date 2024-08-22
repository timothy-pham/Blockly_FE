export function getCurrentDateTime(format = 'dd/mm/yyyy hh:mm:ss') {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()

  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  let dateTime = ''

  switch (format.toLowerCase()) {
    case 'ddmmyyyy':
      dateTime = `${day}${month}${year}`
      break
    case 'ddmmyyyyhhmmss':
      dateTime = `${day}${month}${year}${hours}${minutes}${seconds}`
      break
    case 'dd/mm/yyyy hh:mm:ss':
      dateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
      break
    default:
      dateTime = `${day}${month}${year}${hours}${minutes}${seconds}`
      break
  }

  return dateTime
}

import moment from "moment";
export function getTime(start, end) {
  const totalTime = moment(end).diff(moment(start), "seconds");
  return moment.utc(totalTime * 1000).format("mm:ss");
}