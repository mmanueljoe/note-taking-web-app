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