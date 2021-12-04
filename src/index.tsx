import {
  connect,
  Field,
  FieldIntentCtx,
  RenderFieldExtensionCtx,
} from "datocms-plugin-sdk";
import { render } from "./utils/render";
import { Canvas, Button, Form, FieldGroup, TextField } from "datocms-react-ui";
import "datocms-react-ui/styles.css";
import { useCallback, useMemo, useState } from "react";

type PropTypes = {
  ctx: RenderFieldExtensionCtx;
};

function ManualGeolocation({ ctx }: PropTypes) {
  const [coordinates, setCoordinates] = useState("");

  const validCoords = useMemo(() => {
    const parts = coordinates
      .split(coordinates.indexOf(",") !== -1 ? "," : " ")
      .map((t) => t.trim())
      .filter((t) => t.trim().length > 0);
    if (parts.length !== 2) {
      return false;
    }
    const [lat, lng] = parts;

    if (lat.trim() === "" || lng.trim() === "") {
      return false;
    }
    try {
      const latVal = parseFloat(lat.trim());
      const lngVal = parseFloat(lng.trim());

      return (
        Number.isFinite(latVal) &&
        Number.isFinite(lngVal) &&
        latVal >= -90 &&
        latVal <= 90 &&
        lngVal >= -180 &&
        lngVal <= 180
      );
    } catch (error) {
      return false;
    }
  }, [coordinates]);

  const setLocation = useCallback(() => {
    const [lat, lng] = coordinates
      .split(coordinates.indexOf(",") !== -1 ? "," : " ")
      .map((t) => t.trim())
      .filter((t) => t.trim().length > 0);
    ctx.setFieldValue(ctx.fieldPath, {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    });
  }, [coordinates, ctx]);

  return (
    <Canvas ctx={ctx}>
      <Form
        onSubmit={setLocation}
        style={{ display: "flex", alignItems: "center" }}
      >
        <FieldGroup style={{ flex: "1 1 auto" }}>
          <TextField
            value={coordinates}
            onChange={setCoordinates}
            id="latLong"
            name="latLong"
            label="Manual latitude and longitude"
            hint={`The latitude and longitude in decimal format, separated by a space or a comma. E.g. "12.34 114.5", "12.34, 114.5" or "12.34,114.5". A period (.) should be used as the decimal separator. The latitude and longitude must be in the -90..90 and -180..180 range, respectively.`}
          />
        </FieldGroup>
        <FieldGroup style={{ flex: "0 0 auto", marginLeft: 16 }}>
          <Button
            type="button"
            onClick={setLocation}
            buttonSize="xxs"
            buttonType={validCoords ? "muted" : "primary"}
            disabled={!validCoords}
          >
            Set coordinates
          </Button>
        </FieldGroup>
      </Form>
    </Canvas>
  );
}

connect({
  overrideFieldExtensions(field: Field, ctx: FieldIntentCtx) {
    if (field.attributes.field_type === "lat_lon") {
      return {
        addons: [{ id: "manualGeolocation" }],
      };
    }
  },
  renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
    switch (fieldExtensionId) {
      case "manualGeolocation":
        return render(<ManualGeolocation ctx={ctx} />);
    }
  },
});
