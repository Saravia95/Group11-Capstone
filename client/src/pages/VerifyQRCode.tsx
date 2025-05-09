import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { verifyQRCode } from '../utils/authUtils';
import { Helmet } from 'react-helmet-async';

const VerifyQRCode = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  useEffect(() => {
    verifyQRCode(id!)
      .then((response) => {
        if (response.success) {
          navigate('/main');
        }
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [id, navigate]);

  return (
    <div className="container">
      <Helmet title="Verifying... | JukeVibes" />
      <h2 className="heading-2 mt-10 text-center">
        {isVerifying ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin />
            &nbsp; Verifying...
          </>
        ) : (
          'Oops, this QR code is invalid :/'
        )}
      </h2>
    </div>
  );
};

export default VerifyQRCode;
