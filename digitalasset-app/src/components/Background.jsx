import { useEffect, useState } from "react";

const Background = () => {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    // Generate random blocks for the background
    const generateBlocks = () => {
      const newBlocks = [];
      const colors = [
        "rgba(138, 43, 226, 0.2)", // purple
        "rgba(0, 180, 216, 0.15)", // blue
        "rgba(75, 0, 130, 0.15)", // indigo
      ];

      for (let i = 0; i < 25; i++) {
        const size = Math.random() * 100 + 50;
        newBlocks.push({
          id: i,
          left: Math.random() * 100 + "%",
          top: Math.random() * 100 + "%",
          size: size + "px",
          color: colors[Math.floor(Math.random() * colors.length)],
          animationDelay: Math.random() * 8 + "s",
          animationDuration: Math.random() * 12 + 8 + "s",
          rotate: Math.random() * 360 + "deg",
        });
      }
      setBlocks(newBlocks);
    };

    generateBlocks();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {blocks.map((block) => (
        <div
          key={block.id}
          className="floating-block"
          style={{
            left: block.left,
            top: block.top,
            width: block.size,
            height: block.size,
            backgroundColor: block.color,
            animationDelay: block.animationDelay,
            animationDuration: block.animationDuration,
            transform: `rotate(${block.rotate})`,
            borderRadius: "8px",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          }}
        />
      ))}
      <div className="background-overlay"></div>
    </div>
  );
};

export default Background;
