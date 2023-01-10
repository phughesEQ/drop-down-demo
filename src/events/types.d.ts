
export type configType = {
    URL: string;
    vertical: string;
    partner: string;
    attributes: []
};

export type configEnvTypes = Pick<configType, 'URL' | 'partner'>
