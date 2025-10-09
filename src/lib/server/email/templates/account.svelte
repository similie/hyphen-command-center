<script lang="ts">
    import { type SiteConfig, type UserModel } from "$lib";
    import {
        Text,
        Button,
        Html,
        Heading,
        Body,
        Container,
        Head,
    } from "svelte-email-tailwind";
    export let config: SiteConfig;
    export let user: Partial<UserModel>;
    export let href: string = config?.apiBaseUrl || "https://academy.tl";
</script>

<Html lang="en">
    <Head />
    <Body>
        <Container>
            <Heading class="text-amber-600 text-2xl"
                >{user.name || "Similie User"},</Heading
            >
            <Text
                >{"Thank you for using" +
                    " " +
                    (config?.siteName || "Similie Services")}.</Text
            >

            <Text>
                You had a new account created for you on
                {config?.siteName || "Similie Services"}. Click the link below
                to login to your account.
            </Text>

            <Text>
                Username: {user.username}
            </Text>

            <Text>
                Password: {user.password}
            </Text>

            <Button class="bg-amber-600 p-2 rounded-2xl text-[#fff]" {href}
                >{"Visit Now"}</Button
            >
        </Container>
    </Body>
</Html>
