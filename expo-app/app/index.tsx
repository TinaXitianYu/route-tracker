// app/index.tsx

import { Button, ButtonText } from "@/components/ui/button";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { VStack } from "@/components/ui/vstack";
import { Image } from "react-native";

const Index = () => {
  return (
    <SafeAreaView className="md:flex flex-col items-center justify-center md:w-full h-full pb-5">
      <VStack className="p-2 md:max-w-[440px] w-full" space="xl">
        <Image
          source={{
            uri: "https://engineering.washu.edu/about/facilities/images/East-End-campus-aerial.jpg",
          }}
          alt="image"
          style={{
            marginBottom: 100,
            width: '100%',
            height: 500,
          }}
        />

        <Button
          className="bg-primary-500"
          style={{
            marginStart: 10,
            marginEnd: 10,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            router.push("auth/splash-screen");
          }}
        >
          <ButtonText>Get Started</ButtonText>
        </Button>

        <Button
          className="bg-primary-500"
          style={{
            marginStart: 10,
            marginEnd: 10,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            router.push("profile/profile");
          }}
        >
          <ButtonText>Profile (*DEV*)</ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
};

export default Index;
