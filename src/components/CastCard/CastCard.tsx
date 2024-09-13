import React from 'react';
import { originalImage } from '../../services/apiConfigs';
import { LazyLoadImage } from 'react-lazy-load-image-component';

type CastProps = {
    name: string;
    character: string;
    profile_path: string | null;
};

const CastCard = ({ name, character, profile_path }: CastProps) => {
    return (
        <div className="card text-center">
            <LazyLoadImage
                wrapperClassName='h-full w-full block rounded-lg overflow-hidden my-3 mx-3 '
                effect='blur'
                loading='lazy'
                className='w-full h-full object-cover'
                alt={name}
                src={profile_path ? originalImage(profile_path, 200) : 'https://via.placeholder.com/150x200?text=No+Image'}
            />
            <div className='text-white font-medium text-sm'>{name}</div>
            <div className='text-light-gray text-xs'>{character}</div>
        </div>
    );
};

export default CastCard;
