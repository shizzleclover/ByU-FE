'use client'

import { motion, useTransform, useScroll } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const cards = [
  { id: 1, src: "/fashion.png", width: "15vw", height: "25vh" },
  { id: 2, src: "/blue.png", width: "25vw", height: "40vh" },
  { id: 3, src: "/orange.png", width: "40vw", height: "55vh" },
  { id: 4, src: "/swim.png", width: "55vw", height: "65vh" },
  { id: 5, src: "/horse.png", width: "65vw", height: "75vh" },
];

export const HorizontalScrollCarousel = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["40vw", "-150vw"]);

  return (
    <section ref={targetRef} className="relative h-[400vh] mt-[-10vh]">
      <div className="sticky top-0 flex h-screen items-end overflow-hidden z-20">
        <motion.div style={{ x }} className="flex items-end gap-0">
          {cards.map((card, index) => {
            return <Card card={card} key={card.id} index={index} />;
          })}
        </motion.div>
      </div>
    </section>
  );
};

const Card = ({ card, index }: { card: typeof cards[0]; index: number }) => {
  return (
    <motion.div
      key={card.id}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative overflow-hidden flex-shrink-0 origin-left z-20"
      style={{
        width: card.width,
        height: card.height,
        // Optional: you could add a subtle scale transition here if needed, 
        // but the progressive widths already create the "vanishing point" look.
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${card.src})`,
        }}
      />
      {/* We use standard CSS background instead of next/image for easy cover scaling, 
          or we could use next/image with layout="fill" */}
      <Image
        src={card.src}
        alt="Showcase image"
        fill
        className="object-cover"
        sizes="50vw"
        priority={card.id > 3}
      />
    </motion.div>
  );
};
