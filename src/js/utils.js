export const getElementByType = (type, value) => {
    switch (type.toLowerCase()) {
        case 'id':
            return document.getElementById(value);
        case 'class':
            return Array.from(document.getElementsByClassName(value));
        case 'tag':
            return Array.from(document.getElementsByTagName(value));
        default:
            return null;
    }
}

export const debounce = (func, delay) => {
    let timeoutId;
    return function(...args){
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    }
}