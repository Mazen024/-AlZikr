import { Image, View } from "react-native";

export default function Index() {
  return (
    <View>
      <Image
        source={require("../../assets/images/back.png")}
        style={{ width: "100%", height: "100%", resizeMode: "contain" }}
      />
    </View>
  );
}
