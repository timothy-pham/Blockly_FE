const roomStatus = {
    'playing': {
        'text': "Đang chơi",
        'color': '#fff400'
    },
    'waiting': {
        'text': "Chờ người chơi",
        'color': '#c1ff12'
    },
    'finished': {
        'text': "Kết thúc",
        'color': '#ff0000'
    }
}

const getRoomStatus = (status) => {
    return roomStatus[status]?.text || 'Không xác định';
}

const getRoomColor = (status) => {
    return roomStatus[status]?.color || 'black';
}

export { getRoomStatus, getRoomColor };