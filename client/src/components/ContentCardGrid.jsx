import React, { useEffect, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ContentCardGrid({ title, thunk, selector }) {
  const dispatch = useDispatch();
  const { items, loading, error, totalPages } = useSelector(
    selector,
    shallowEqual
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(thunk({ page, limit: 6 }));
  }, [dispatch, thunk, page]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-6 tracking-tight">
        {title}
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-600/20 border-l-4 border-red-500 text-red-300 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-lg">
              <Skeleton
                height={180}
                baseColor="#374151"
                highlightColor="#4b5563"
              />
              <Skeleton
                count={2}
                baseColor="#374151"
                highlightColor="#4b5563"
              />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence>
              {items.length > 0 ? (
                items.map((item) => (
                  <Link
                    key={item._id}
                    to={`/audio/${item._id}`}
                    className="block group"
                    aria-label={`View details for ${item.title}`}
                  >
                    <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      whileHover={{
                        y: -4,
                        transition: { duration: 0.2 },
                      }}
                      className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/30 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={
                            item.thumbnailUrl ||
                            "https://via.placeholder.com/300x150?text=Audio"
                          }
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-1 sm:p-3 space-y-2">
                        <h3 className="text-base font-semibold text-gray-100 truncate group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </h3>
                        {item.category && (
                          <p className="text-sm text-gray-400 font-medium line-clamp-1 capitalize">
                            <span className="text-gray-200">Category:</span>{" "}
                            {item.category}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ))
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-400 text-center text-lg py-8 col-span-full"
                >
                  No audios found.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {!loading && items.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="py-2 px-4 rounded-lg bg-amber-400 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-500 transition-colors duration-200"
              >
                Previous
              </button>
              <span className="text-gray-200">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
                className="py-2 px-4 rounded-lg bg-amber-400 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-500 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}