import React from "react";
import { Keyboard, Platform, Dimensions } from "react-native";

const useKeyboardInset = () => {
  const [inset, setInset] = React.useState(0);

  React.useEffect(() => {
    // iOS: willChangeFrame gives most accurate height (handles QuickType bar)
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const screenH = Dimensions.get("screen").height;

    const onShow = (e) => {
      if (!e?.endCoordinates) return setInset(0);
      if (Platform.OS === "ios") {
        // how much of the screen the keyboard covers
        const kb = Math.max(0, screenH - e.endCoordinates.screenY);
        setInset(kb);
      } else {
        setInset(e.endCoordinates.height ?? 0);
      }
    };

    const onHide = () => setInset(0);

    const s = Keyboard.addListener(showEvt, onShow);
    const h = Keyboard.addListener(hideEvt, onHide);
    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  return inset;
};

export default useKeyboardInset;
