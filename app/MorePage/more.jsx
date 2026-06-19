import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DONATIONS, SECTIONS } from "../constants/homeConstants";
import root from "../constants/root";
import HijriModal from "./calendar";

const { Tcolors, Fonts, FontSizes, Spacing, BorderRadius } = root;

function SectionLabel({ label }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function Badge({ text }) {
  const isSoon = text === "قريباً";
  return (
    <View style={[styles.badge, isSoon ? styles.badgeSoon : styles.badgeNew]}>
      <Text
        style={[
          styles.badgeText,
          isSoon ? styles.badgeTextSoon : styles.badgeTextNew,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function Row({ item, isLast, onPress }) {
  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={item.route ? 0.7 : 1}
        disabled={!item.route}
      >
        <Text style={styles.chevron}>›</Text>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          {item.sub ? <Text style={styles.rowSub}>{item.sub}</Text> : null}
        </View>
        {item.badge && <Badge text={item.badge} />}
        <View style={[styles.rowIcon, { backgroundColor: item.iconBg }]}>
          <Text style={{ fontSize: 18 }}>{item.icon}</Text>
        </View>
      </TouchableOpacity>
      {!isLast && <View style={styles.divider} />}
    </>
  );
}

function DonationCard({ item, onPress }) {
  return (
    <View style={styles.donationCard} activeOpacity={0.8}>
      <View style={[styles.donationIcon, { backgroundColor: item.iconBg }]}>
        <Text style={{ fontSize: 22 }}>{item.icon}</Text>
      </View>
      <Text style={styles.donationTitle}>{item.title}</Text>
      <Text style={styles.donationSub}>{item.sub}</Text>
      <TouchableOpacity onPress={onPress} style={styles.donationCta}>
        <Text style={styles.donationCtaText}>تبرع الآن</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function MorePage() {
  const router = useRouter();
  const [hijriVisible, setHijriVisible] = useState(false);

  const handlePress = (item) => {
    if (!item.route) return;
    if (item.route === "modal:hijri") {
      setHijriVisible(true);
      return;
    }
    router.push(item.route);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المزيد</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((section) => (
          <View key={section.label}>
            <SectionLabel label={section.label} />
            <View style={styles.group}>
              {section.items.map((item, i) => (
                <Row
                  key={item.title}
                  item={item}
                  isLast={i === section.items.length - 1}
                  onPress={() => handlePress(item)}
                />
              ))}
            </View>
          </View>
        ))}

        <SectionLabel label="غزة في قلوبنا 🇵🇸" />
        <ScrollView
          horizontal
          style={{ direction: "rtl" }}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.donationsRow}
        >
          {DONATIONS.map((item) => (
            <View key={item.title}>
              <DonationCard
                item={item}
                onPress={() => Linking.openURL(item.url)}
              />
            </View>
          ))}
        </ScrollView>

        <View style={{ height: 48 }} />
      </ScrollView>

      <HijriModal
        visible={hijriVisible}
        onClose={() => setHijriVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    backgroundColor: Tcolors.secondaryBackground,
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  headerTitle: {
    fontSize: FontSizes.xl || 20,
    fontWeight: "500",
    color: Tcolors.primaryText,
    textAlign: "right",
    fontFamily: Fonts.arabic,
  },
  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: 12,
    color: Tcolors.secondaryText || "rgba(255,255,255,0.45)",
    textAlign: "right",
    paddingHorizontal: Spacing.md,
    paddingTop: 16,
    paddingBottom: 6,
    fontFamily: Fonts.arabic,
  },
  group: {
    marginHorizontal: 12,
    backgroundColor: Tcolors.card || "rgba(255,255,255,0.05)",
    borderRadius: BorderRadius.lg || 16,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    alignItems: "flex-end",
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Tcolors.primaryText,
    fontFamily: Fonts.arabic,
  },
  rowSub: {
    fontSize: 12,
    color: Tcolors.secondaryText || "rgba(255,255,255,0.45)",
    marginTop: 2,
    textAlign: "right",
    fontFamily: Fonts.arabic,
  },
  chevron: {
    fontSize: 20,
    color: Tcolors.secondaryText || "rgba(255,255,255,0.35)",
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 20,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeSoon: { backgroundColor: "rgba(239,159,39,0.15)" },
  badgeNew: { backgroundColor: "rgba(83,74,183,0.2)" },
  badgeText: { fontSize: 10, fontWeight: "500", fontFamily: Fonts.arabic },
  badgeTextSoon: { color: "#EF9F27" },
  badgeTextNew: { color: "#7F77DD" },

  donationsRow: {
    paddingHorizontal: 12,
    gap: 10,
  },
  donationCard: {
    width: 150,
    backgroundColor: Tcolors.card || "rgba(255,255,255,0.05)",
    borderRadius: BorderRadius.lg || 16,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 14,
    alignItems: "flex-start",
  },
  donationIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  donationTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Tcolors.primaryText,
    textAlign: "right",
    fontFamily: Fonts.arabic,
  },
  donationSub: {
    fontSize: 11,
    color: Tcolors.secondaryText || "rgba(255,255,255,0.45)",
    textAlign: "right",
    marginTop: 4,
    marginBottom: 12,
    fontFamily: Fonts.arabic,
  },
  donationCta: {
    alignSelf: "stretch",
    backgroundColor: Tcolors.BG_DARK,
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: "center",
  },
  donationCtaText: {
    fontSize: 12,
    fontWeight: "600",
    color: Tcolors.primaryLight,
    fontFamily: Fonts.arabic,
  },
});
