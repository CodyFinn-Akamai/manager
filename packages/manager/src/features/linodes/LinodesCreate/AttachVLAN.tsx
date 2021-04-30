import { Interface } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import Box from 'src/components/core/Box';
import Chip from 'src/components/core/Chip';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import HelpIcon from 'src/components/HelpIcon';
import { queryClient } from 'src/queries/base';
import { ExtendedRegion, useRegionsQuery } from 'src/queries/regions';
import { queryKey as vlansQueryKey } from 'src/queries/vlans';
import arrayToList from 'src/utilities/arrayToDelimiterSeparatedList';
import {
  doesRegionSupportVLANs,
  regionsWithVLANs,
} from 'src/utilities/doesRegionSupportVLANs';
import InterfaceSelect from '../LinodesDetail/LinodeSettings/InterfaceSelect';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingBottom: theme.spacing(3),
  },
  title: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  chip: {
    fontSize: '0.625rem',
    height: 15,
    marginTop: 2,
    marginLeft: theme.spacing(),
    marginBottom: theme.spacing(2),
    letterSpacing: '.25px',
    textTransform: 'uppercase',
  },
  paragraphBreak: {
    marginTop: 16,
  },
}));

interface Props {
  vlanLabel: string;
  labelError?: string;
  ipamAddress: string;
  ipamError?: string;
  readOnly?: boolean;
  region?: string;
  helperText?: string;
  handleVLANChange: (updatedInterface: Interface) => void;
}

type CombinedProps = Props;

const AttachVLAN: React.FC<CombinedProps> = (props) => {
  const {
    handleVLANChange,
    helperText,
    vlanLabel,
    labelError,
    ipamAddress,
    ipamError,
    readOnly,
    region,
  } = props;

  const classes = useStyles();

  React.useEffect(() => {
    // Ensure VLANs are fresh.
    queryClient.invalidateQueries(vlansQueryKey);
  }, []);

  const regions = useRegionsQuery().data ?? [];
  const selectedRegion = region || '';

  const regionSupportsVLANs = doesRegionSupportVLANs(selectedRegion, regions);

  const regionsThatSupportVLANs = regionsWithVLANs(regions).map(
    (region: ExtendedRegion) => region.display
  );

  const regionalAvailabilityMessage = `VLANs are currently available in ${arrayToList(
    regionsThatSupportVLANs,
    ';'
  )}.`;

  return (
    <div className={classes.root}>
      <Box display="flex" alignItems="center">
        <Typography variant="h2" className={classes.title}>
          Attach a VLAN {helperText ? <HelpIcon text={helperText} /> : null}
        </Typography>
        <Chip className={classes.chip} label="beta" component="span" />
      </Box>
      <Grid container>
        <Grid item xs={12}>
          <Typography>{regionalAvailabilityMessage}</Typography>
          <Typography variant="body1" className={classes.paragraphBreak}>
            VLANs are used to create a private L2 Virtual Local Area Network
            between Linodes. A VLAN created or attached in this section will be
            assigned to the eth1 interface, with eth0 being used for connections
            to the public internet. VLAN configurations can be further edited in
            the Linode&apos;s{' '}
            <ExternalLink
              text="Configuration Profile"
              link="https://linode.com/docs/guides/disk-images-and-configuration-profiles/"
              hideIcon
            />
            .
          </Typography>
          <Typography className={classes.paragraphBreak}>
            VLAN is currently in beta and is subject to the terms of the{' '}
            <ExternalLink
              text="Early Adopter Testing Agreement"
              link="https://www.linode.com/legal-eatp/"
              hideIcon
            />
            .
          </Typography>
          <InterfaceSelect
            slotNumber={1}
            readOnly={readOnly || !regionSupportsVLANs || false}
            label={vlanLabel}
            labelError={labelError}
            purpose="vlan"
            ipamAddress={ipamAddress}
            ipamError={ipamError}
            handleChange={(newInterface: Interface) =>
              handleVLANChange(newInterface)
            }
            region={region}
            fromAddonsPanel
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default React.memo(AttachVLAN);
