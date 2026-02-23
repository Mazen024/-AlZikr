import { Image, View } from "react-native";

export default function Index() {
  return (
    <View>
      <Image
        source={require("../../assets/images/back2.png")}
        style={{ width: "100%", height: "100%", resizeMode: "cover" }}
      />
    </View>
  );
}
