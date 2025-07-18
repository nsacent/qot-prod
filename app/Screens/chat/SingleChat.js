import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { COLORS, FONTS, IMAGES } from "../../constants/theme";
import ChatoptionSheet from "../../components/BottomSheet/ChatoptionSheet";
import { GlobalStyleSheet } from "../../constants/StyleSheet";
import Anotherprofile from "../profile/Anotherprofile";

const initialChatData = [
  { id: "1", title: "Hi, yatin👋!", send: false },
  {
    id: "2",
    title:
      "Can you send presentation file from Mr. Alex? I lost it and can’t find that 😢.",
    time: "4.40pm",
    send: false,
  },
  { id: "3", title: "Yoo, sure Deep", send: true },
  {
    id: "4",
    title: "Let me find that presentation at my laptop, give me a second!",
    time: "4.50pm",
    send: true,
  },
  {
    id: "5",
    title: "Yes sure, take your time Brian",
    time: "4.55pm",
    send: false,
  },
  { id: "6", title: "History of animal Biolo...", time: "4.56pm", send: true },
  {
    id: "7",
    title: "Thank you for helping me! ❤ You save my life hahaha! ",
    time: "4.57pm",
    send: false,
  },
  { id: "8", title: "You, sure Deep👍 ", time: "4.58pm", send: true },
  {
    id: "9",
    title: "Thank you for helping me! ❤ You save my life hahaha! ",
    time: "4.57pm",
    send: false,
  },
  { id: "10", title: "You, sure Deep👍 ", time: "4.58pm", send: true },
  {
    id: "11",
    title: "Thank you for helping me! ❤ You save my life hahaha! ",
    time: "4.57pm",
    send: false,
  },
  { id: "12", title: "You, sure Deep👍 ", time: "4.58pm", send: true },
];

const SingleChat = ({ navigation }) => {
  const theme = useTheme();
  const { colors } = theme;
  const moresheet = React.useRef();
  const insets = useSafeAreaInsets();

  const [chatData, setChatData] = useState(initialChatData);
  const [message, setMessage] = useState("");
  const scrollViewRef = useRef();

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      const height = e.endCoordinates.height;
      setKeyboardHeight(height);
      console.log("Keyboard height:", height);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      100
    );
  }, [chatData]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const newMsg = {
      id: Date.now().toString(),
      title: trimmed,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      send: true,
    };

    setChatData((prev) => [...prev, newMsg]);
    setMessage("");
    //Keyboard.dismiss();
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatData]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.dark ? "#000" : "#eee" }}
    >
      <View
        style={[
          GlobalStyleSheet.container,
          { backgroundColor: colors.background },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 5,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                style={{ width: 18, height: 18, tintColor: colors.title }}
                source={IMAGES.arrowleft}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginRight: 20, marginLeft: 15 }}
              onPress={() => navigation.navigate("ItemDetails")}
            >
              <View>
                <Image
                  style={{ width: 45, height: 45, borderRadius: 6 }}
                  source={IMAGES.car1}
                />
              </View>
              <View
                style={{
                  position: "absolute",
                  bottom: -8,
                  right: -8,
                  borderWidth: 2,
                  borderColor: colors.card,
                  borderRadius: 50,
                }}
              >
                <Image
                  style={{ width: 20, height: 20, borderRadius: 50 }}
                  source={IMAGES.Small7}
                />
              </View>
            </TouchableOpacity>
            <View>
              <TouchableOpacity
                onPress={() => navigation.navigate(Anotherprofile)}
              >
                <Text
                  style={{
                    ...FONTS.font,
                    ...FONTS.fontMedium,
                    color: colors.title,
                    marginBottom: 3,
                  }}
                >
                  Deepesh Gour
                </Text>
              </TouchableOpacity>
              <Text
                numberOfLines={1}
                style={{
                  ...FONTS.fontXs,
                  color: colors.title,
                  opacity: 0.7,
                  paddingRight: 90,
                }}
              >
                NIKON CORPORATION, NIKON D5500
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Call")}
              style={{ padding: 10 }}
            >
              <Image
                style={[GlobalStyleSheet.image, { tintColor: colors.title }]}
                source={IMAGES.call}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => moresheet.current.openSheet()}
              style={{ padding: 10 }}
            >
              <Image
                style={[GlobalStyleSheet.image, { tintColor: colors.title }]}
                source={IMAGES.more}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 15, paddingBottom: 10 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {chatData.map((data, index) => (
          <View
            key={data.id + index}
            style={{
              width: "75%",
              marginBottom: 10,
              alignSelf: data.send ? "flex-end" : "flex-start",
              alignItems: data.send ? "flex-end" : "flex-start",
            }}
          >
            <View
              style={{
                backgroundColor: data.send ? COLORS.primary : COLORS.background,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                borderBottomLeftRadius: data.send ? 10 : 0,
                borderBottomRightRadius: data.send ? 0 : 10,
                paddingVertical: 10,
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  ...FONTS.font,
                  ...FONTS.fontRegular,
                  color: data.send ? COLORS.white : COLORS.title,
                }}
              >
                {data.title}
              </Text>
            </View>
            {data.time && (
              <Text
                style={{
                  ...FONTS.fontXs,
                  ...FONTS.fontRegular,
                  color: colors.title,
                  opacity: 0.4,
                  marginTop: 3,
                }}
              >
                {data.time}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View
        style={{
          backgroundColor: colors.card,
          paddingHorizontal: 10,
          borderTopWidth: 1,
          borderTopColor: colors.borderColor,
          marginBottom: keyboardHeight, // 👈 ADD TH/IS LINE
        }}
      >
        <View>
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 13,
              left: 0,
            }}
          >
            <Image
              style={{
                tintColor: colors.Text,
                width: 20,
                height: 20,
                resizeMode: "contain",
              }}
              source={IMAGES.happy}
            />
          </TouchableOpacity>
          <TextInput
            placeholder="Send your message..."
            placeholderTextColor={
              theme.dark ? "rgba(255,255,255,0.6)" : "rgba(18,9,46,0.5)"
            }
            multiline
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
            style={[
              GlobalStyleSheet.inputBox,
              {
                marginBottom: 0,
                paddingLeft: 30,
                paddingRight: 70,
                paddingTop: 8,
                color: colors.Text,
              },
            ]}
          />
          <TouchableOpacity
            style={{ position: "absolute", top: 13, right: 40 }}
          >
            <Image
              style={{
                tintColor: colors.title,
                opacity: 0.5,
                width: 20,
                height: 20,
                resizeMode: "contain",
              }}
              source={IMAGES.camera}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ position: "absolute", top: 13, right: 0 }}
            onPress={sendMessage}
          >
            <Image
              style={{
                tintColor: colors.primary,
                width: 20,
                height: 20,
                resizeMode: "contain",
              }}
              source={IMAGES.send}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ChatoptionSheet ref={moresheet} />
    </SafeAreaView>
  );
};

export default SingleChat;
