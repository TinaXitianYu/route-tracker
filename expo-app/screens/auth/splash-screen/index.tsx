import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image, Text } from "react-native";
import {
  GluestackIcon,
  GluestackIconDark,
} from "./assets/icons/gluestack-icon";
import { useColorScheme } from "nativewind";

import useRouter from "@unitools/router";
import { AuthLayout } from "../layout";

import { Pressable } from "@/components/ui/pressable";

import {
  ArrowLeftIcon,
} from "@/components/ui/icon";

const SplashScreenWithLeftBackground = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  return (
    <VStack className="w-full h-full max-w-[440px] justify-center">
      {/* Place the Pressable button at the top left */}
      <Pressable
        onPress={() => {
          router.back();
        }}
        className="absolute top-4 left-3 z-10" // Ensure it's positioned at the top left
      >
        <Icon
          as={ArrowLeftIcon}
          className="text-background-800"
          size="xl"
        />
      </Pressable>

      {/* Centered content */}
      <VStack
        className="items-center"
        space="lg"
      >
        {/* {colorScheme === "dark" ? (
          <Icon as={GluestackIconDark} className="w-[219px] h-10" />
        ) : (
          <Icon as={GluestackIcon} className="w-[219px] h-10" />
        )} */}

      <Image
        source={{
        uri: "https://source.washu.edu/app/uploads/2024/08/WashU-RGB-600x400-1.jpg",
        }}
        alt="image"
        style={{ 
                width: '100%', 
                height: 100 }} // Adjust height as necessary
      />
        
        <VStack className="w-full" space="lg">
          <Button
            className="w-full"
            onPress={() => {
              router.push("/auth/signin");
            }}
          >
            <ButtonText className="font-medium">Log in</ButtonText>
          </Button>

          <Button
            onPress={() => {
              router.push("/auth/signup");
            }}
          >
            <ButtonText className="font-medium">Sign Up</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </VStack>
  );
};

export const SplashScreen = () => {
  return (
    <AuthLayout>
      <SplashScreenWithLeftBackground />
    </AuthLayout>
  );
};
