import classNames from 'classnames';
import React, { useRef, memo } from 'react';
import { Pagination, Navigation, Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import CastCard from '../CastCard/CastCard';
import SkeletonCard from '../Skeleton/SkeletonCard';

type CastMember = {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
};

type Props = {
    className?: string;
    data: CastMember[];
    skeleton?: boolean;
};

const ListCastHorizontal = memo((props: Props) => {
    const navigationPrevRef = useRef<HTMLDivElement>(null);
    const navigationNextRef = useRef<HTMLDivElement>(null);
    const swiperRef = useRef<SwiperType>();

    const handleSlideChange = (swiper: SwiperType) => {
        if (!swiperRef.current || !navigationNextRef.current || !navigationPrevRef.current) return;

        if (swiper.isBeginning) {
            navigationPrevRef.current?.classList.remove("active");
        } else {
            navigationPrevRef.current.classList.add("active");
        }

        if (swiper.activeIndex === swiper.slides.length - 2) {
            navigationNextRef.current.classList.remove("active");
        } else {
            navigationNextRef.current.classList.add("active");
        }
    };

    return (
        <Swiper
            slidesPerView={"auto"}
            modules={[Navigation, Pagination]}
            pagination={{
                dynamicBullets: true,
            }}
            onBeforeInit={(swiper) => {
                swiperRef.current = swiper;
            }}
            className={classNames(props.className)}
            onSlideChange={handleSlideChange}
        >
            {props.skeleton && new Array(10).fill(0).map((_, index) => {
                return (
                    <SwiperSlide key={index.toString() + "list-horizontal"} className='w-32 pr-4 self-stretch'>
                        <SkeletonCard size='normal' />
                    </SwiperSlide>
                );
            })}

            {!props.skeleton && props.data.map((cast, index) => {
                return (
                    <SwiperSlide className='w-32 pr-4 self-stretch' key={cast.id.toString() + `-${Math.random()}`}>
                        <CastCard name={cast.name} character={cast.character} profile_path={cast.profile_path} />
                    </SwiperSlide>
                );
            })}

            <div ref={navigationNextRef} onClick={() => swiperRef.current?.slideNext()} className='absolute w-20 h-20 bg-black/30 pl-1 [&.active]:flex hover:bg-black transition duration-300 rounded-full translate-x-[65%] hidden active justify-start items-center cursor-pointer top-2/4 right-0 -translate-y-2/4 hover:text-white text-white/30 z-10 text-3xl'><MdKeyboardArrowRight /></div>
            <div ref={navigationPrevRef} onClick={() => swiperRef.current?.slidePrev()} className='absolute w-20 h-20 bg-black/30 pr-1 [&.active]:flex hover:bg-black transition duration-300 rounded-full -translate-x-[65%] hidden justify-end items-center cursor-pointer top-2/4 left-0 -translate-y-2/4 hover:text-white text-white/30 z-10 text-3xl'><MdKeyboardArrowLeft /></div>
        </Swiper>
    );
});

export default ListCastHorizontal;
