import { Button, ButtonText } from "@/components/ui/button";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { VStack } from "@/components/ui/vstack";
import { Image, Text } from "react-native";
const index = () => {
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
                height: 500 }} // Adjust height as necessary
      />

      

        <Button
        className="bg-primary-500"
          style={{
            marginStart: 10,
            marginEnd: 10,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center'
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
            alignItems: 'center'
          }}
          onPress={() => {
            router.push("profile/profile");
          }}
        >
          <ButtonText>Profile (*DEV*)</ButtonText>
        </Button>

        {/* <Button
          className="w-full"
          onPress={() => {
            router.push("auth/signin");
          }}
        >
          <ButtonText>Sign in</ButtonText>
        </Button> */}

        {/* <Button
          onPress={() => {
            router.push("auth/signup");
          }}
        >
          <ButtonText>Sign up</ButtonText>
        </Button> */}

        {/* <Button
          onPress={() => {
            router.push("auth/forgot-password");
          }}
        >
          <ButtonText>Forgot password</ButtonText>
        </Button> */}

        {/* <Button
          onPress={() => {
            router.push("auth/create-password");
          }}
        >
          <ButtonText>Create password</ButtonText>
        </Button> */}

        {/* <Button
          onPress={() => {
            router.push("news-feed/news-and-feed");
          }}
        >
          <ButtonText>News feed</ButtonText>
        </Button> */}

        {/* <Button
          onPress={() => {
            router.push("dashboard/dashboard-layout");
          }}
        >
          <ButtonText>Dashboard</ButtonText>
        </Button> */}
      </VStack>
    </SafeAreaView>
  );
};

export default index;