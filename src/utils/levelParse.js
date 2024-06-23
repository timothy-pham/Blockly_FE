const levels = {
    '0': {
        name: 'Siêu dễ',
        color: '#83ec09',
    },
    '1': {
        name: 'Dễ',
        color: '#c1ff12',
    },
    '2': {
        name: 'Trung bình',
        color: '#fff400',
    },
    '3': {
        name: 'Khó',
        color: '#d89901',
    },
    '4': {
        name: 'Siêu khó',
        color: '#ff0000',
    },
}

const getColor = (level) => {
    return levels[`${level}`]?.color || 'black';
}

const getLabel = (level) => {
    return levels[`${level}`]?.name || 'Không xác định';
}

export { getColor, getLabel };