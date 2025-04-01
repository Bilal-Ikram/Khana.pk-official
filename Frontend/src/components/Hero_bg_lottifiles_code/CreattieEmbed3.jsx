import { useEffect } from "react";

const CreattieEmbed3 = () => {
  useEffect(() => {
    // Load the Creattie embed script dynamically
    const script = document.createElement("script");
    script.src = "https://creattie.com/js/embed.js?id=3f6954fde297cd31b441";
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Cleanup on unmount
    };
  }, []);

  return (
    <div>
      <creattie-embed
        src="https://d1jj76g3lut4fe.cloudfront.net/saved_colors/113198/y8bxXqsSuK3Bv17f.json"
        delay="1"
        speed="100"
        frame_rate="24"
        trigger="loop"
        style={{ width: "600px", backgroundColor: "transparent" }}
      ></creattie-embed>
    </div>
  );
};

export default CreattieEmbed3;
