import { Button, Divider, Grid, Stack, Text } from "@mantine/core";
import type { ContextModalProps } from "@mantine/modals";
import { Fragment } from "react/jsx-runtime";

export function InformationModal({
    context,
    id,
    innerProps,
}: ContextModalProps<{ information: any }>) {
    const data = Object.entries(innerProps.information);

    const excludedColumns = ["updated_at", "created_at"];

    return (
        <Stack>
            <Grid>
                <Grid.Col span={4}>
                    <Text
                        style={{
                            fontWeight: 700,
                        }}>
                        Attribute
                    </Text>
                </Grid.Col>
                <Grid.Col span={8}>
                    <Text
                        style={{
                            fontWeight: 700,
                        }}>
                        Value
                    </Text>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Divider />
                </Grid.Col>
                {data.map(([key, value]: [string, any], index: number) => {
                    if (excludedColumns.includes(key)) return null;
                    return (
                        <Fragment key={`${id}-${key}-${index}`}>
                            <Grid.Col span={4}>
                                <Text
                                    style={{
                                        fontWeight: 700,
                                    }}>
                                    {key}
                                </Text>
                            </Grid.Col>
                            <Grid.Col span={8}>
                                <Text>{value}</Text>
                            </Grid.Col>
                        </Fragment>
                    );
                })}
            </Grid>
            <Button fullWidth mt="md" onClick={() => context.closeModal(id)}>
                Close
            </Button>
        </Stack>
    );
}
