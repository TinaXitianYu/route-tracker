import React, { useState } from "react";
import { Toast, ToastTitle, useToast } from "@/components/ui/toast";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { LinkText } from "@/components/ui/link";
import Link from "@unitools/link";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import {
  ArrowLeftIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  Icon,
} from "@/components/ui/icon";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Keyboard } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { GoogleIcon } from "./assets/icons/google";
import { Pressable } from "@/components/ui/pressable";
import useRouter from "@unitools/router";
import { supabase } from 'utils/supabase';  // Supabase client import
import { AuthLayout } from "../layout";

// Define sign-up validation schema
const signUpSchema = z.object({
  email: z.string().min(1, "Email is required").email(),
  password: z
    .string()
    .min(6, "Must be at least 8 characters in length")
    .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
    .regex(new RegExp(".*[a-z].*"), "One lowercase character")
    .regex(new RegExp(".*\\d.*"), "One number")
    .regex(
      new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
      "One special character"
    ),
  confirmpassword: z
    .string()
    .min(6, "Must be at least 8 characters in length")
    .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
    .regex(new RegExp(".*[a-z].*"), "One lowercase character")
    .regex(new RegExp(".*\\d.*"), "One number")
    .regex(
      new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"),
      "One special character"
    ),
  rememberme: z.boolean().optional(),
});
type SignUpSchemaType = z.infer<typeof signUpSchema>;

const SignUpWithLeftBackground = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
  });
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: SignUpSchemaType) => {
    if (data.password === data.confirmpassword) {
      setLoading(true);

      // Supabase sign-up logic
      const { error, data: { session } } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.show({
          placement: "bottom right",
          render: ({ id }) => (
            <Toast nativeID={id} variant="danger">
              <ToastTitle>{error.message}</ToastTitle>
            </Toast>
          ),
        });
      } else {
        toast.show({
          placement: "bottom right",
          render: ({ id }) => (
            <Toast nativeID={id} variant="accent" action="success">
              <ToastTitle>
                {session ? "Signed up successfully!" : "Please check your inbox for verification"}
              </ToastTitle>
            </Toast>
          ),
        });
        reset();
      }

      setLoading(false);
    } else {
      toast.show({
        placement: "bottom right",
        render: ({ id }) => (
          <Toast nativeID={id} variant="danger">
            <ToastTitle>Passwords do not match</ToastTitle>
          </Toast>
        ),
      });
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleState = () => {
    setShowPassword((showState) => !showState);
  };
  const handleConfirmPwState = () => {
    setShowConfirmPassword((showState) => !showState);
  };
  const handleKeyPress = () => {
    Keyboard.dismiss();
    handleSubmit(onSubmit)();
  };

  const router = useRouter();

  return (
    <VStack className="max-w-[440px] w-full" space="md">
      <VStack className="md:items-center" space="md">
        <Pressable
          onPress={() => {
            router.back();
          }}
        >
          <Icon
            as={ArrowLeftIcon}
            className="md:hidden stroke-background-800"
            size="xl"
          />
        </Pressable>
        <VStack>
          <Heading className="md:text-center" size="3xl">
            Sign up
          </Heading>
          <Text>Sign up and start using gluestack</Text>
        </VStack>
      </VStack>
      <VStack className="w-full">
        <VStack space="xl" className="w-full">
          {/* Email Input */}
          <FormControl isInvalid={!!errors.email}>
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="email"
              defaultValue=""
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    className="text-sm"
                    placeholder="Email"
                    type="text"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="md" as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.email?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Password Input */}
          <FormControl isInvalid={!!errors.password}>
            <FormControlLabel>
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue=""
              name="password"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    className="text-sm"
                    placeholder="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                    type={showPassword ? "text" : "password"}
                  />
                  <InputSlot onPress={handleState} className="pr-3">
                    <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="sm" as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.password?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Confirm Password Input */}
          <FormControl isInvalid={!!errors.confirmpassword}>
            <FormControlLabel>
              <FormControlLabelText>Confirm Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              defaultValue=""
              name="confirmpassword"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Confirm Password"
                    className="text-sm"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    onSubmitEditing={handleKeyPress}
                    returnKeyType="done"
                    type={showConfirmPassword ? "text" : "password"}
                  />

                  <InputSlot onPress={handleConfirmPwState} className="pr-3">
                    <InputIcon
                      as={showConfirmPassword ? EyeIcon : EyeOffIcon}
                    />
                  </InputSlot>
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorIcon size="sm" as={AlertTriangle} />
              <FormControlErrorText>
                {errors?.confirmpassword?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Terms and Conditions Checkbox */}
          <Controller
            name="rememberme"
            defaultValue={false}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                size="sm"
                value="Remember me"
                isChecked={value}
                onChange={onChange}
                aria-label="Remember me"
              >
                <CheckboxIndicator>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel>
                  I accept the Terms of Use & Privacy Policy
                </CheckboxLabel>
              </Checkbox>
            )}
          />
        </VStack>

        {/* Submit Button */}
        <VStack className="w-full my-7" space="lg">
          <Button className="w-full" onPress={handleSubmit(onSubmit)} disabled={loading}>
            <ButtonText className="font-medium">Sign up</ButtonText>
          </Button>
          <Button
            variant="outline"
            action="secondary"
            className="w-full gap-1"
            onPress={() => {}}
          >
            <ButtonText className="font-medium">
              Continue with Google
            </ButtonText>
            <ButtonIcon as={GoogleIcon} />
          </Button>
        </VStack>
        
        {/* Login Link */}
        <HStack className="self-center" space="sm">
          <Text size="md">Already have an account?</Text>
          <Link href="/auth/signin">
            <LinkText
              className="font-medium text-primary-700 group-hover/link:text-primary-600 group-hover/pressed:text-primary-700"
              size="md"
            >
              Login
            </LinkText>
          </Link>
        </HStack>
      </VStack>
    </VStack>
  );
};

export const SignUp = () => {
  return (
    <AuthLayout>
      <SignUpWithLeftBackground />
    </AuthLayout>
  );
};
