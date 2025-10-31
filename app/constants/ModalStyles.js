import { StyleSheet, Platform } from "react-native";
import { SIZES } from "./theme";

const ModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 0,
  },
  modalContent: {
    width: "100%",
    maxWidth: 350,
    borderRadius: SIZES.radius,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 25,
  },
});

export default ModalStyles;
