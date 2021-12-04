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
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const validCoords = useMemo(() => {
    if (lat.trim() === "" || lng.trim() === "") {
      return false;
    }
    try {
      const latVal = parseFloat(lat.trim());
      const lngVal = parseFloat(lng.trim());

      return Number.isFinite(latVal) && Number.isFinite(lngVal);
    } catch (error) {
      return false;
    }
  }, [lat, lng]);

  const setLocation = useCallback(() => {
    ctx.setFieldValue(ctx.fieldPath, {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    });
  }, [lat, lng, ctx]);

  return (
    <Canvas ctx={ctx}>
      <Form
        onSubmit={setLocation}
        style={{ display: "flex", alignItems: "center" }}
      >
        <FieldGroup style={{ flex: "0 0 200px" }}>
          <TextField
            required
            value={lat}
            onChange={setLat}
            id="lat"
            name="latitude"
            label="Latitude"
          />
        </FieldGroup>
        <FieldGroup style={{ flex: "0 0 200px", marginLeft: 16 }}>
          <TextField
            required
            value={lng}
            onChange={setLng}
            id="lng"
            name="longitude"
            label="Longitude"
          />
        </FieldGroup>
        <FieldGroup style={{ flex: "0 0 200px", marginLeft: 16 }}>
          <Button
            type="button"
            onClick={setLocation}
            buttonSize="xxs"
            buttonType="muted"
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
