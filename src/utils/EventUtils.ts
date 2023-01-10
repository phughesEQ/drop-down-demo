export const cleanFunctionName = (name: String) => {
    let lambdaName = name.split('Handler').shift() || ''
    let cleanName = lambdaName.split('-').pop() || ''
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
}

export const getRandomVertical = () => {
    const verticals = ['auto', 'home', 'life']
    return verticals[Math.floor(Math.random()*verticals.length)]
}
