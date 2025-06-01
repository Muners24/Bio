import { useLayoutEffect, useRef } from "react";

let savedScroll = 0;

export default function usePreserveScroll() {
  useLayoutEffect(() => {
    return () => {
      savedScroll = window.scrollY;
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, savedScroll);
  }, []);
}
