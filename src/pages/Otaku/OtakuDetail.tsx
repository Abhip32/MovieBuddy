import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  IoPlay,
  IoStar,
  IoCalendar,
  IoTv,
  IoFilm,
  IoArrowBack,
  IoSparkles,
} from "react-icons/io5";
import { BiMoviePlay } from "react-icons/bi";
import Wrapper from "../../components/Wrapper/Wrapper";
import otakuService, { AniListMedia } from "../../services/otakuService";
import { useVideoModal } from "../../context/VideoModal/VideoModal.context";

const OtakuDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoModal = useVideoModal();

  const [anime, setAnime] = useState<AniListMedia | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(false);
    window.scrollTo(0, 0);

    otakuService
      .getAnimeDetail(parseInt(id))
      .then((data) => {
        if (data) {
          setAnime(data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleOpenTrailer = () => {
    if (anime?.trailer?.site === "youtube" && anime.trailer.id) {
      videoModal?.open(`https://www.youtube.com/embed/${anime.trailer.id.trim()}`);
    } else {
      const q = encodeURIComponent(`${anime?.title.english || anime?.title.romaji || "Anime"} trailer`);
      videoModal?.open(`https://www.youtube.com/results?search_query=${q}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent border-dark-purple rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Anime Not Found</h2>
        <p className="text-sm text-light-gray mb-6">Unable to load details for this anime.</p>
        <Link
          to="/otaku"
          className="px-5 py-2.5 rounded-full bg-dark-purple hover:bg-deep-purple font-semibold text-sm transition-colors"
        >
          Back to Otaku Hub
        </Link>
      </div>
    );
  }

  const englishTitle = anime.title.english || anime.title.romaji || "Anime Detail";
  const romajiTitle = anime.title.romaji;
  const nativeTitle = anime.title.native;
  const totalEpisodes = anime.episodes || 1;
  const isMovie = anime.format === "MOVIE";
  const studioName = anime.studios?.nodes?.[0]?.name;
  const bannerBg = anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large;

  return (
    <div className="min-h-screen bg-black text-white font-poppins pb-20">
      {/* Huge Backdrop Banner */}
      <div className="relative w-full h-[380px] sm:h-[460px] md:h-[540px] bg-black-2 overflow-hidden">
        {bannerBg && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${bannerBg})`,
              filter: "brightness(0.65)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />

        {/* Top Back Button */}
        <div className="absolute top-24 left-4 sm:left-8 z-20">
          <button
            onClick={() => navigate("/otaku")}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white hover:bg-dark-purple transition-colors cursor-pointer"
          >
            <IoArrowBack size={15} />
            <span>Otaku Hub</span>
          </button>
        </div>
      </div>

      {/* Main Content Info */}
      <Wrapper className="relative z-20 -mt-36 sm:-mt-44 md:-mt-52">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Left Column: Poster & Quick Action */}
          <div className="flex-shrink-0 self-center md:self-start w-52 sm:w-60 md:w-68">
            <div className="rounded-2xl overflow-hidden border-2 border-white/15 shadow-2xl bg-black-2 aspect-[2/3]">
              <img
                src={anime.coverImage.extraLarge || anime.coverImage.large}
                alt={englishTitle}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Direct Play & Trailer Buttons */}
            <div className="mt-4 space-y-2.5">
              <Link
                to={`/otaku/stream/${anime.id}`}
                className="w-full py-3 px-4 rounded-xl bg-dark-purple hover:bg-deep-purple font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-dark-purple/30 cursor-pointer transform active:scale-95"
              >
                <IoPlay size={18} />
                <span>Stream Anime Now</span>
              </Link>

              <button
                type="button"
                onClick={handleOpenTrailer}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white hover:text-black border border-white/15 font-semibold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BiMoviePlay size={17} />
                <span>Watch Trailer</span>
              </button>
            </div>
          </div>

          {/* Right Column: Titles, Meta, Genres, Description */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dark-purple/30 text-purple-300 border border-dark-purple/50 uppercase tracking-wider">
                  Otaku Verified
                </span>

                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-white flex items-center gap-1">
                  {isMovie ? <IoFilm size={11} /> : <IoTv size={11} />}
                  <span>{anime.format || "ANIME"}</span>
                </span>

                {anime.status && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-light-gray font-medium">
                    {anime.status}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                {englishTitle}
              </h1>

              {romajiTitle && romajiTitle !== englishTitle && (
                <p className="text-sm sm:text-base text-purple-300 font-medium italic mt-1">
                  {romajiTitle} {nativeTitle ? `(${nativeTitle})` : ""}
                </p>
              )}
            </div>

            {/* Quick Meta Stats Row */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-light-gray font-medium flex-wrap pt-1">
              {anime.averageScore && (
                <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                  <IoStar size={14} /> {(anime.averageScore / 10).toFixed(1)} / 10
                </span>
              )}

              {anime.seasonYear && (
                <span className="flex items-center gap-1">
                  <IoCalendar size={14} className="text-light-gray" /> {anime.seasonYear}
                </span>
              )}

              {!isMovie && totalEpisodes && (
                <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10 text-white">
                  {totalEpisodes} Episodes
                </span>
              )}

              {studioName && (
                <span className="text-purple-300">
                  Studio: <strong className="text-white">{studioName}</strong>
                </span>
              )}
            </div>

            {/* Genre Pills */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {anime.genres.map((g) => (
                  <Link
                    key={g}
                    to={`/otaku`}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-dark-purple/30 border border-white/10 hover:border-dark-purple/50 text-xs text-light-gray hover:text-white transition-colors"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis / Description */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Synopsis
              </h3>
              <p className="text-xs sm:text-sm text-light-gray leading-relaxed whitespace-pre-line max-w-3xl">
                {anime.description || "No description provided for this anime."}
              </p>
            </div>

            {/* Episode Quick-Picker Grid */}
            {!isMovie && totalEpisodes > 1 && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Episodes ({totalEpisodes})
                  </h3>
                  <Link
                    to={`/otaku/stream/${anime.id}?ep=1`}
                    className="text-xs text-dark-purple hover:underline font-semibold"
                  >
                    Play Episode 1 &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-4 xs:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {Array.from({ length: Math.min(totalEpisodes, 100) }, (_, i) => i + 1).map((ep) => (
                    <Link
                      key={ep}
                      to={`/otaku/stream/${anime.id}?ep=${ep}`}
                      className="py-2 rounded-xl bg-white/5 hover:bg-dark-purple text-light-gray hover:text-white text-xs font-semibold flex flex-col items-center justify-center border border-white/10 transition-colors"
                    >
                      <span className="text-[10px] text-purple-300">EP</span>
                      <span>{ep}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Characters & Voice Actors */}
            {anime.characters?.edges && anime.characters.edges.length > 0 && (
              <div className="pt-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  Key Characters & Japanese Voice Cast
                </h3>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                  {anime.characters.edges.map((edge) => (
                    <div
                      key={edge.node.id}
                      className="p-2 rounded-xl bg-black-2 border border-white/10 flex items-center gap-2.5"
                    >
                      {edge.node.image?.medium && (
                        <img
                          src={edge.node.image.medium}
                          alt={edge.node.name.full}
                          className="w-10 h-10 rounded-full object-cover border border-white/15"
                        />
                      )}
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-white truncate">
                          {edge.node.name.full}
                        </p>
                        <p className="text-[10px] text-purple-300 truncate">
                          {edge.voiceActors?.[0]?.name?.full || edge.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Similar Anime */}
            {anime.recommendations?.nodes && anime.recommendations.nodes.length > 0 && (
              <div className="pt-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  You Might Also Like
                </h3>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {anime.recommendations.nodes
                    .filter((n) => n.mediaRecommendation?.coverImage?.large)
                    .slice(0, 5)
                    .map((n) => {
                      const rec = n.mediaRecommendation!;
                      const recTitle = rec.title.english || rec.title.romaji || "Anime";
                      return (
                        <Link
                          key={rec.id}
                          to={`/otaku/detail/${rec.id}`}
                          className="group rounded-xl overflow-hidden bg-black-2 border border-white/10 hover:border-dark-purple/60 transition-all flex flex-col"
                        >
                          <div className="aspect-[2/3] w-full overflow-hidden bg-black">
                            <img
                              src={rec.coverImage?.large}
                              alt={recTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                              {recTitle}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default OtakuDetail;
