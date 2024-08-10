export const validatePassword = (password) => {
    // const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    // return regex.test(password);
    if (password?.length < 6) {
        return false;
    } else {
        return true;
    }
}