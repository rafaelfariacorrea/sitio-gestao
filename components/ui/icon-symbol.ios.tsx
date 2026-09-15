import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

const legacyMap: Record<string, IconName> = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconName | string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: string;
}) {
  void weight;
  const materialName = legacyMap[name] ?? (name as IconName);
  return <MaterialIcons color={color} size={size} name={materialName} style={style} />;
}
