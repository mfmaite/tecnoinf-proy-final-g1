import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type MenuItem = { label: string; onPress: () => void };

type Props = {
  items: MenuItem[];
};

export const OverflowMenu: React.FC<Props> = ({ items }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ position: "relative", zIndex: 1000 }}>
      <TouchableOpacity onPress={() => setOpen((v) => !v)} style={styles.trigger} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.triggerText}>⋮</Text>
      </TouchableOpacity>
      {open ? (
        <View style={styles.menu}>
          {items.map((it, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setOpen(false);
                it.onPress();
              }}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemText}>{it.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  triggerText: {
    fontSize: 18,
  },
  menu: {
    position: "absolute",
    top: 28,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 140,
  },
  menuItemText: {
    fontWeight: "600",
  },
});

export default OverflowMenu;


